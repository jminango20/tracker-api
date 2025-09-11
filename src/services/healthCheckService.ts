import { publicClient } from '../config/blockchain';

interface ServiceHealth {
    name: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    error?: string;
    details?: any;
}

interface OverallHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    services: ServiceHealth[];
}

interface BlockchainHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    network: {
        chainId?: number;
        blockNumber?: number;
        gasPrice?: string;
        nodeUrl: string;
    };
    responseTime: number;
    lastCheck: string;
}

export class HealthCheckService {
    private getPublicClient() {
        return publicClient;
    }

    async getOverallHealth(): Promise<OverallHealth> {
        const services: ServiceHealth[] = [];

        services.push({
            name: 'api',
            status: 'healthy',
            responseTime: 0,
            details: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            }
        });

        const blockchainHealth = await this.checkBlockchainConnection();
        services.push({
            name: 'blockchain',
            status: blockchainHealth.status,
            responseTime: blockchainHealth.responseTime,
            error: blockchainHealth.status !== 'healthy' ? 'Blockchain connection issues' : undefined,
            details: blockchainHealth.network
        });

        const unhealthyServices = services.filter(s => s.status === 'unhealthy').length;
        const degradedServices = services.filter(s => s.status === 'degraded').length;

        let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
        if (unhealthyServices > 0) {
            overallStatus = 'unhealthy';
        } else if (degradedServices > 0) {
            overallStatus = 'degraded';
        }

        return {
            status: overallStatus,
            services
        };
    }

    async getBlockchainHealth(): Promise<BlockchainHealth> {
        const startTime = Date.now();
        
        try {
            const client = this.getPublicClient();
            
            // Informações básicas da rede
            const [chainId, blockNumber, gasPrice] = await Promise.all([
                client.getChainId(),
                client.getBlockNumber(),
                client.getGasPrice().catch(() => null)
            ]);

            const responseTime = Date.now() - startTime;

            return {
                status: 'healthy',
                network: {
                    chainId: Number(chainId),
                    blockNumber: Number(blockNumber),
                    gasPrice: gasPrice?.toString(),
                    nodeUrl: process.env.RPC_URL || 'unknown'
                },
                responseTime,
                lastCheck: new Date().toISOString()
            };

        } catch (error) {
            return {
                status: 'unhealthy',
                network: {
                    nodeUrl: process.env.RPC_URL || 'unknown'
                },
                responseTime: Date.now() - startTime,
                lastCheck: new Date().toISOString()
            };
        }
    }

    private async checkBlockchainConnection(): Promise<{ status: 'healthy' | 'unhealthy' | 'degraded', responseTime: number, network: any }> {
        const startTime = Date.now();
        
        try {
            const client = this.getPublicClient();
            const blockNumber = await client.getBlockNumber();
            const responseTime = Date.now() - startTime;
            
            // Consideramos degraded se a resposta demorar mais que 5 segundos
            const status = responseTime > 5000 ? 'degraded' : 'healthy';
            
            return {
                status,
                responseTime,
                network: {
                    blockNumber: Number(blockNumber),
                    nodeUrl: process.env.RPC_URL || 'unknown'
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                network: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    nodeUrl: process.env.RPC_URL || 'unknown'
                }
            };
        }
    }
}