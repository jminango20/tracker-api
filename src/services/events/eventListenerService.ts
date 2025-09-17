import { createPublicClient, http, decodeEventLog, toEventSelector } from 'viem';
import { EventStorageService } from './eventStorageService';
import { AddressDiscoveryService } from '../addressDiscoveryService';
import { IASSET_REGISTRY_ABI } from '../../config/abis/IAssetRegistry';

export class EventListenerService {
    private client: any;
    private eventStorageService: EventStorageService;
    private addressDiscoveryService: AddressDiscoveryService;
    private assetRegistryAddress: string | null = null;
    private isRunning: boolean = false;
    private pollingInterval: NodeJS.Timeout | null = null;
    private lastProcessedBlock: bigint = BigInt(0);
    private pollingIntervalMs: number = 20000; // 20 segundos
    private eventSignatures: Record<string, string> = {};

    constructor() {
        this.eventStorageService = new EventStorageService();
        this.addressDiscoveryService = new AddressDiscoveryService();
        this.initializeEventSignatures();
    }

    /**
     * Inicializar signatures dos eventos usando o ABI
     */
    private initializeEventSignatures() {
        // Extrair apenas os eventos do ABI
        const events = IASSET_REGISTRY_ABI.filter(item => item.type === 'event');
        
        for (const event of events) {
            try {
                // Calcular signature do evento usando viem
                const signature = toEventSelector(event);
                this.eventSignatures[signature] = event.name;
                
                console.log(`Event signature initialized: ${event.name} -> ${signature}`);
            } catch (error) {
                console.error(`Erro ao calcular signature para evento ${event.name}:`, error);
            }
        }
        
        console.log(`Initialized ${Object.keys(this.eventSignatures).length} event signatures`);
    }

    /**
     * Inicializar cliente HTTP e obter endereço do AssetRegistry
     */
    async initialize() {
        try {
            console.log('Inicializando EventListenerService (Polling Mode)...');

            // 1. Obter endereço do AssetRegistry
            await this.loadAssetRegistryAddress();

            // 2. Configurar cliente HTTP
            this.client = createPublicClient({
                transport: http(process.env.BESU_RPC_URL || 'http://localhost:8545')
            });

            // 3. Obter último bloco processado do banco
            await this.loadLastProcessedBlock();

            console.log('Cliente HTTP configurado');
            console.log('AssetRegistry address:', this.assetRegistryAddress);
            console.log('Último bloco processado:', this.lastProcessedBlock.toString());

        } catch (error) {
            console.error('Erro ao inicializar EventListenerService:', error);
            throw error;
        }
    }

    /**
     * Obter endereço do AssetRegistry via AddressDiscovery
     */
    private async loadAssetRegistryAddress() {
        const result = await this.addressDiscoveryService.getAddress('ASSET_REGISTRY');
        
        if (!result.success || !result.data?.addressContract) {
            throw new Error('AssetRegistry não encontrado no AddressDiscovery');
        }

        this.assetRegistryAddress = result.data.addressContract;
    }

    /**
     * Carregar último bloco processado do banco de dados
     */
    private async loadLastProcessedBlock() {
        try {
            const lastEvent = await this.eventStorageService.getLastProcessedBlock();
            this.lastProcessedBlock = lastEvent ? BigInt(lastEvent.blockNumber) : BigInt(0);
        } catch (error) {
            console.log('Nenhum bloco processado anteriormente, iniciando do bloco 0');
            this.lastProcessedBlock = BigInt(0);
        }
    }

    /**
     * Iniciar polling de eventos
     */
    async startListening() {
        if (this.isRunning) {
            console.log('EventListenerService já está rodando');
            return;
        }

        try {
            await this.initialize();
            this.isRunning = true;

            console.log(`Iniciando polling de eventos a cada ${this.pollingIntervalMs}ms...`);

            // Processar blocos imediatamente
            await this.pollForNewBlocks();

            // Configurar interval para polling contínuo
            this.pollingInterval = setInterval(async () => {
                await this.pollForNewBlocks();
            }, this.pollingIntervalMs);

        } catch (error) {
            console.error('Erro ao iniciar polling:', error);
            this.isRunning = false;
        }
    }

    /**
     * Verificar por novos blocos e processar eventos
     */
    private async pollForNewBlocks() {
        try {
            // 1. Obter número do último bloco na rede
            const latestBlockNumber = await this.client.getBlockNumber();
            
            if (latestBlockNumber <= this.lastProcessedBlock) {
                return; // Nenhum bloco novo
            }

            console.log(`Processando blocos ${this.lastProcessedBlock + BigInt(1)} até ${latestBlockNumber}`);

            // 2. Processar blocos em lotes para evitar timeouts
            const batchSize = 100; // Processar 100 blocos por vez
            let currentBlock = this.lastProcessedBlock + BigInt(1);

            while (currentBlock <= latestBlockNumber) {
                const endBlock = currentBlock + BigInt(batchSize - 1) > latestBlockNumber 
                    ? latestBlockNumber 
                    : currentBlock + BigInt(batchSize - 1);

                await this.processBlockRange(currentBlock, endBlock);
                currentBlock = endBlock + BigInt(1);
            }

            // 3. Atualizar último bloco processado
            this.lastProcessedBlock = latestBlockNumber;
            await this.eventStorageService.saveLastProcessedBlock(Number(latestBlockNumber));

        } catch (error) {
            console.error('Erro durante polling:', error);
        }
    }

    /**
     * Processar eventos em um range de blocos
     */
    private async processBlockRange(fromBlock: bigint, toBlock: bigint) {
        try {
            // Buscar logs de eventos do AssetRegistry no range de blocos
            // Não especificar events - deixar capturar todos os eventos do contrato
            const logs = await this.client.getLogs({
                address: this.assetRegistryAddress,
                fromBlock: fromBlock,
                toBlock: toBlock
            });

            if (logs.length > 0) {
                console.log(`Encontrados ${logs.length} eventos nos blocos ${fromBlock} - ${toBlock}`);
                await this.processEventLogs(logs);
            }

        } catch (error) {
            console.error(`Erro ao processar blocos ${fromBlock}-${toBlock}:`, error);
        }
    }

    /**
     * Processar logs de eventos
     */
    private async processEventLogs(logs: any[]) {
        for (const log of logs) {
            try {
                const eventData = await this.parseEventLog(log);
                
                if (eventData) {
                    await this.eventStorageService.saveAssetEvent(eventData);
                    console.log(`Evento ${eventData.eventName} salvo - Asset: ${eventData.primaryAssetId} - Bloco: ${log.blockNumber}`);
                }

            } catch (error) {
                console.error('Erro ao processar log:', error);
                console.error('Log problemático:', log);
            }
        }
    }

    /**
     * Parse de evento usando ABI automaticamente
     */
    private async parseEventLog(log: any) {
        const eventName = this.identifyEventType(log.topics[0]);
        
        if (!eventName) {
            console.log('Tipo de evento não reconhecido:', log.topics[0]);
            return null;
        }

        try {
            // Encontrar definição do evento no ABI
            const eventAbi = IASSET_REGISTRY_ABI.find(
                item => item.type === 'event' && item.name === eventName
            );

            if (!eventAbi) {
                console.error(`ABI não encontrado para evento: ${eventName}`);
                return null;
            }

            // Decodificar usando o ABI
            const decoded = decodeEventLog({
                abi: [eventAbi],
                data: log.data,
                topics: log.topics
            });

            // Converter para formato do banco baseado no tipo de evento
            return this.convertEventToStorageFormat(eventName, log, decoded);

        } catch (error) {
            console.error(`Erro ao parsear evento ${eventName}:`, error);
            return null;
        }
    }

    /**
     * Identificar tipo de evento pela signature (usando ABI calculado)
     */
    private identifyEventType(signature: string): string | null {
        return this.eventSignatures[signature] || null;
    }

    /**
     * Converter evento decodificado para formato do banco
     */
    private convertEventToStorageFormat(eventName: string, log: any, decoded: any) {
        const baseEvent = {
            blockNumber: BigInt(log.blockNumber),
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            eventName: eventName,
            channelName: decoded.args.channelName,
            timestamp: new Date(Number(decoded.args.timestamp) * 1000)
        };

        switch (eventName) {
            case 'AssetCreated':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.assetId,
                    owner: decoded.args.owner,
                    operation: 'CREATE',
                    eventData: {
                        location: decoded.args.location,
                        amount: decoded.args.amount.toString()
                    }
                };

            case 'AssetSplit':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.originalAssetId,
                    secondaryAssetId: decoded.args.newAssetIds[0],
                    owner: decoded.args.owner,
                    operation: 'SPLIT',
                    relatedAssetIds: decoded.args.newAssetIds,
                    amounts: decoded.args.amounts.map((amt: any) => BigInt(amt)),
                    eventData: {
                        originalAssetId: decoded.args.originalAssetId,
                        totalNewAssets: decoded.args.newAssetIds.length
                    }
                };

            case 'AssetLineage':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.childAssetId,
                    secondaryAssetId: decoded.args.parentAssetId,
                    owner: decoded.args.owner,
                    operation: 'LINEAGE',
                    eventData: {
                        relationshipType: Number(decoded.args.relationshipType),
                        relationshipName: this.getRelationshipTypeName(Number(decoded.args.relationshipType))
                    }
                };

            case 'AssetComposition':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.assetId,
                    owner: decoded.args.owner,
                    operation: 'COMPOSITION',
                    relatedAssetIds: decoded.args.componentAssets,
                    amounts: decoded.args.componentAmounts.map((amt: any) => BigInt(amt)),
                    eventData: {
                        totalComponents: decoded.args.componentAssets.length,
                        totalAmount: decoded.args.componentAmounts.reduce((sum: bigint, amt: any) => sum + BigInt(amt), BigInt(0)).toString()
                    }
                };
            
            case 'AssetsGrouped':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.groupAssetId,
                    owner: decoded.args.owner,
                    operation: 'GROUP',
                    relatedAssetIds: decoded.args.originalAssetIds,
                    amounts: [BigInt(decoded.args.totalAmount)],
                    eventData: {
                        originalAssetIds: decoded.args.originalAssetIds,
                        totalGroupedAssets: decoded.args.originalAssetIds.length,
                        totalAmount: decoded.args.totalAmount.toString()
                    }
                };

            case 'AssetsUngrouped':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.groupAssetId,
                    owner: decoded.args.owner,
                    operation: 'UNGROUP',
                    relatedAssetIds: decoded.args.originalAssetIds,
                    eventData: {
                        groupAssetId: decoded.args.groupAssetId,
                        reactivatedAssets: decoded.args.originalAssetIds,
                        totalReactivatedAssets: decoded.args.originalAssetIds.length
                    }
                };

            case 'AssetTransformed':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.newAssetId,
                    secondaryAssetId: decoded.args.originalAssetId,
                    owner: decoded.args.owner,
                    operation: 'TRANSFORM',
                    eventData: {
                        originalAssetId: decoded.args.originalAssetId,
                        transformationType: 'FULL_TRANSFORMATION'
                    }
                };

            case 'AssetUpdated':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.assetId,
                    owner: decoded.args.owner,
                    operation: 'UPDATE',
                    eventData: {
                        newLocation: decoded.args.newLocation,
                        newAmount: decoded.args.newAmount.toString()
                    }
                };

            case 'AssetTransferred':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.assetId,
                    owner: decoded.args.toOwner,
                    operation: 'TRANSFER',
                    eventData: {
                        fromOwner: decoded.args.fromOwner,
                        toOwner: decoded.args.toOwner,
                        previousLocation: decoded.args.previousLocation,
                        newLocation: decoded.args.newLocation,
                        previousAmount: decoded.args.previousAmount.toString(),
                        newAmount: decoded.args.newAmount.toString()
                    }
                };
            
            case 'AssetCustodyChanged':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.assetId,
                    owner: decoded.args.toOwner,
                    operation: 'CUSTODY_CHANGED',
                    eventData: {
                        fromOwner: decoded.args.fromOwner,
                        toOwner: decoded.args.toOwner,
                        previousLocation: decoded.args.previousLocation,
                        newLocation: decoded.args.newLocation,
                        previousAmount: decoded.args.previousAmount.toString(),
                        newAmount: decoded.args.newAmount.toString()
                    }
                };
            
            case 'AssetStateChanged':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.assetId,
                    owner: decoded.args.toOwner,
                    operation: 'STATE_CHANGED',
                    eventData: {
                        fromOwner: decoded.args.fromOwner,
                        toOwner: decoded.args.toOwner,
                        previousLocation: decoded.args.previousLocation,
                        newLocation: decoded.args.newLocation,
                        previousAmount: decoded.args.previousAmount.toString(),
                        newAmount: decoded.args.newAmount.toString()
                    }
                };

            case 'AssetInactivated':
                return {
                    ...baseEvent,
                    primaryAssetId: decoded.args.assetId,
                    owner: decoded.args.owner,
                    operation: 'INACTIVATE',
                    eventData: {
                        lastOperation: Number(decoded.args.lastOperation)
                    }
                };

            default:
                console.log(`Conversão não implementada para evento: ${eventName}`);
                return {
                    ...baseEvent,
                    primaryAssetId: 'UNKNOWN',
                    operation: 'UNKNOWN',
                    eventData: decoded.args
                };
        }
    }

    /**
     * Helper para converter relationship type em nome
     */
    private getRelationshipTypeName(type: number): string {
        const types = {
            0: 'CREATE',
            1: 'SPLIT', 
            2: 'TRANSFORM',
            3: 'GROUP_COMPONENT',
            4: 'UNGROUP'
        };
        return types[type as keyof typeof types] || 'UNKNOWN';
    }

    /**
     * Parar polling
     */
    async stopListening() {
        console.log('Parando EventListenerService...');
        this.isRunning = false;
        
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        
        await this.eventStorageService.disconnect();
        console.log('EventListenerService parado');
    }

    /**
     * Alterar intervalo de polling
     */
    setPollingInterval(intervalMs: number) {
        this.pollingIntervalMs = intervalMs;
        console.log(`Intervalo de polling alterado para ${intervalMs}ms`);
    }
}