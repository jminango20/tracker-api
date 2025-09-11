import { Request, Response } from 'express';
import { HealthCheckService } from '../services/healthCheckService';
import { ResponseHelper } from '../utils/responseHelper';

export class HealthCheckController {
    private healthCheckService: HealthCheckService;

    constructor() {
        this.healthCheckService = new HealthCheckService();
    }

    // Health check geral da API
    async healthCheck(req: Request, res: Response) {
        try {
            const health = await this.healthCheckService.getOverallHealth();
            
            const statusCode = health.status === 'healthy' ? 200 : 503;
            
            return res.status(statusCode).json({
                status: health.status,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: process.env.API_VERSION || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                services: health.services
            });

        } catch (error) {
            console.error('Erro no health check:', error);
            return res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Health check failed'
            });
        }
    }

    // Status específico da conexão blockchain
    async blockchainStatus(req: Request, res: Response) {
        try {
            const blockchainHealth = await this.healthCheckService.getBlockchainHealth();
            
            const statusCode = blockchainHealth.status === 'healthy' ? 200 : 503;
            
            return res.status(statusCode).json(blockchainHealth);

        } catch (error) {
            console.error('Erro ao verificar status blockchain:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}