import { PrismaClient } from '../../generated/prisma';

export class EventStorageService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Salvar evento de asset no banco
     */
    async saveAssetEvent(eventData: {
        blockNumber: bigint;
        transactionHash: string;
        logIndex: number;
        eventName: string;
        channelName: string;
        timestamp: Date;
        primaryAssetId: string;
        secondaryAssetId?: string;
        owner?: string;
        operation?: string;
        relatedAssetIds?: string[];
        amounts?: bigint[];
        eventData?: any;
    }) {
        try {
            // Tentar inserir o evento
            const savedEvent = await this.prisma.assetEvent.create({
                data: {
                    blockNumber: eventData.blockNumber,
                    transactionHash: eventData.transactionHash,
                    logIndex: eventData.logIndex,
                    eventName: eventData.eventName,
                    channelName: eventData.channelName,
                    timestamp: eventData.timestamp,
                    primaryAssetId: eventData.primaryAssetId,
                    secondaryAssetId: eventData.secondaryAssetId,
                    owner: eventData.owner,
                    operation: eventData.operation,
                    relatedAssetIds: eventData.relatedAssetIds || [],
                    amounts: eventData.amounts || [],
                    eventData: eventData.eventData
                }
            });

            console.log(`Evento ${eventData.eventName} salvo - TX: ${eventData.transactionHash.substring(0,10)}... Log: ${eventData.logIndex}`);
            return savedEvent;

        } catch (error: any) {
            // Verificar se é erro de duplicação na constraint unique_event
            if (error.code === 'P2002' && 
                error.meta?.target && 
                Array.isArray(error.meta.target) &&
                error.meta.target.includes('transactionHash') && 
                error.meta.target.includes('logIndex')) {
                
                console.log(`Evento já existe - TX: ${eventData.transactionHash.substring(0,10)}... Log: ${eventData.logIndex} - Ignorando`);
                return null;
            }
            
            console.error('Erro ao salvar evento:', error);
            throw error;
        }
    }

    /**
     * Buscar eventos de um asset específico
     */
    async getAssetEvents(assetId: string) {
        try {
            const events = await this.prisma.assetEvent.findMany({
                where: {
                    primaryAssetId: assetId
                },
                orderBy: [
                    { blockNumber: 'asc' },
                    { logIndex: 'asc' }
                ]
            });

            console.log(`Encontrados ${events.length} eventos para asset: ${assetId}`);
            return events;

        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            throw error;
        }
    }

    /**
     * Teste rápido - inserir evento fictício
     */
    async testeInserirEvento() {
        const eventoTeste = {
            blockNumber: BigInt(12345),
            transactionHash: '0xabc123def4567891',
            logIndex: 0,
            eventName: 'AssetCreated',
            channelName: 'canal-teste',
            timestamp: new Date(),
            primaryAssetId: 'BEEF-001',
            owner: '0x1234567890123456789012345678901234567890',
            operation: 'CREATE',
            eventData: {
                location: 'Fazenda XYZ',
                amount: 1000,
                description: 'Teste de inserção'
            }
        };

        return await this.saveAssetEvent(eventoTeste);
    }

    /**
     * Salvar último bloco processado (usando tabela dedicada)
     */
    async saveLastProcessedBlock(blockNumber: number) {
        try {
            await this.prisma.blockTracker.upsert({
                where: {
                    id: 1 // ID fixo para o tracker principal
                },
                update: {
                    lastBlock: BigInt(blockNumber),
                    lastUpdated: new Date()
                },
                create: {
                    id: 1,
                    lastBlock: BigInt(blockNumber),
                    serviceName: 'EventListener'
                }
            });

            console.log('Último bloco salvo:', blockNumber);

        } catch (error) {
            console.error('Erro ao salvar último bloco:', error);
        }
    }

    /**
     * Obter último bloco processado
     */
    async getLastProcessedBlock() {
        try {
            const tracker = await this.prisma.blockTracker.findUnique({
                where: { id: 1 }
            });

            return tracker ? {
                blockNumber: Number(tracker.lastBlock),
                lastUpdated: tracker.lastUpdated
            } : null;

        } catch (error) {
            console.error('Erro ao obter último bloco:', error);
            return null;
        }
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}