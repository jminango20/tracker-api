import { createPublicClient, http, decodeEventLog, parseAbiItem } from 'viem';
import { EventRepository } from '../../repositories/eventRepository';
import { BlockTrackerRepository } from '../../repositories/blockTrackerRepository';
import { ProcessorFactory } from '../../processors/processorFactory';
import { convertEventForDatabase, CompleteAssetEvent } from '../../types/blockchainTypes';
import { prisma } from '../../database/prismaClient';
import { AddressDiscoveryService } from '../addressDiscoveryService';

export class IndexerService {
  private client: any;
  private eventRepository: EventRepository;
  private blockTrackerRepository: BlockTrackerRepository;
  private addressDiscoveryService: AddressDiscoveryService;
  private contractAddress: string | null = null;
  private isRunning: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastProcessedBlock: bigint = BigInt(0);
  private readonly POLLING_INTERVAL_MS: number = 5000; // 20 segundos
  private readonly CONFIRMATION_BLOCKS: number = 0; // Esperar confirmações
  private readonly BATCH_SIZE: number = 100; // Processar 100 blocos por vez

  constructor(addressDiscoveryService: AddressDiscoveryService) {
    this.addressDiscoveryService = addressDiscoveryService;
    this.eventRepository = new EventRepository();
    this.blockTrackerRepository = new BlockTrackerRepository();
  }

  async initialize() {
    console.log('Inicializando Indexer Service...');

    await this.loadAssetRegistryAddress();

    // Configurar cliente
    this.client = createPublicClient({
      transport: http(process.env.RPC_URL || 'http://localhost:8545'),
    });

    // Carregar último bloco processado
    const lastBlock = await this.blockTrackerRepository.getLastProcessedBlock();
    this.lastProcessedBlock = lastBlock || BigInt(process.env.START_BLOCK || '0');

    console.log('Indexer inicializado');
    console.log('Contract:', this.contractAddress);
    console.log('Último bloco:', this.lastProcessedBlock.toString());
  }

  private async loadAssetRegistryAddress() {
    const result = await this.addressDiscoveryService.getAddress('ASSET_REGISTRY');

    if (!result.success || !result.data?.addressContract) {
      throw new Error('AssetRegistry não encontrado no AddressDiscovery');
    }

    this.contractAddress = result.data.addressContract;
    console.log('AssetRegistry address carregado:', this.contractAddress);
  }

  async start() {
    if (this.isRunning) {
      console.log('Indexer já está rodando');
      return;
    }

    await this.initialize();
    this.isRunning = true;

    console.log(`Iniciando indexação (polling a cada ${this.POLLING_INTERVAL_MS}ms)`);

    // Processar imediatamente
    await this.poll();

    // Configurar polling contínuo
    this.pollingInterval = setInterval(async () => {
      await this.poll();
    }, this.POLLING_INTERVAL_MS);
  }

  private async poll() {
    try {
      const latestBlock = await this.client.getBlockNumber();
      const safeBlock = latestBlock - BigInt(this.CONFIRMATION_BLOCKS);

      if (safeBlock <= this.lastProcessedBlock) {
        return; // Nenhum bloco novo confirmado
      }

      console.log(`Processando blocos ${this.lastProcessedBlock + BigInt(1)} até ${safeBlock}`);

      // Processar em batches
      let currentBlock = this.lastProcessedBlock + BigInt(1);

      while (currentBlock <= safeBlock) {
        const endBlock =
          currentBlock + BigInt(this.BATCH_SIZE - 1) > safeBlock
            ? safeBlock
            : currentBlock + BigInt(this.BATCH_SIZE - 1);

        await this.processBatch(currentBlock, endBlock);
        currentBlock = endBlock + BigInt(1);
      }

      // Atualizar último bloco processado
      this.lastProcessedBlock = safeBlock;
      await this.blockTrackerRepository.saveLastProcessedBlock(safeBlock);
    } catch (error) {
      console.error('Erro durante polling:', error);
    }
  }

  private async processBatch(fromBlock: bigint, toBlock: bigint) {
    try {
      // 1. Buscar eventos do blockchain
      const logs = await this.client.getLogs({
        address: this.contractAddress,
        fromBlock,
        toBlock,
      });

      if (logs.length === 0) {
        return;
      }

      console.log(`Encontrados ${logs.length} eventos (blocos ${fromBlock}-${toBlock})`);

      // 2. Salvar eventos brutos
      for (const log of logs) {
        const eventData = this.parseEvent(log);
        if (eventData) {
          await this.eventRepository.saveAssetOperationEvent(
            convertEventForDatabase(eventData)
          );
        }
      }

      // 3. Processar eventos em transação
      await this.processEvents(fromBlock, toBlock);
    } catch (error) {
      console.error(`Erro ao processar batch ${fromBlock}-${toBlock}:`, error);
      throw error;
    }
  }

  private async processEvents(fromBlock: bigint, toBlock: bigint) {
    const events = await this.eventRepository.getUnprocessedEvents(fromBlock, toBlock);

    if (events.length === 0) {
      return;
    }

    console.log(`Processando ${events.length} eventos...`);

    // Processar em transação para garantir consistência
    await prisma.$transaction(
      async () => {
        for (const event of events) {
          try {
            const processor = ProcessorFactory.getProcessor(event.operation);
            await processor.process(event);
            await this.eventRepository.markAsProcessed(event.id);
          } catch (error) {
            console.error(`Erro ao processar evento ${event.id}:`, error);
            throw error; // Rollback da transação inteira
          }
        }
      },
      {
        timeout: 60000, // 60 segundos timeout
      }
    );

    console.log(`${events.length} eventos processados com sucesso`);
  }

  private parseEvent(log: any): CompleteAssetEvent | null {
    try {
      const abi = parseAbiItem(
        'event AssetOperationExecuted(bytes32 indexed channelName, bytes32 indexed assetId, uint8 operation, uint8 status, uint256 timestamp, bytes32[] relatedAssetIds, uint256[] relatedAmounts, address indexed owner, string idLocal, uint256 amount, bytes32 dataHash)'
      );

      const decoded = decodeEventLog({
        abi: [abi],
        data: log.data,
        topics: log.topics,
      });

      return {
        channelName: decoded.args.channelName as string,
        assetId: decoded.args.assetId as string,
        operation: Number(decoded.args.operation),
        status: Number(decoded.args.status),
        timestamp: BigInt(decoded.args.timestamp as bigint),
        relatedAssetIds: decoded.args.relatedAssetIds as string[],
        relatedAmounts: (decoded.args.relatedAmounts as bigint[]).map((amt) => BigInt(amt)),
        owner: decoded.args.owner as string,
        idLocal: decoded.args.idLocal as string,
        amount: BigInt(decoded.args.amount as bigint),
        dataHash: decoded.args.dataHash as string,
        metadata: {
          transactionHash: log.transactionHash,
          blockNumber: BigInt(log.blockNumber),
          logIndex: log.logIndex,
          blockTimestamp: BigInt(decoded.args.timestamp as bigint),
        },
      };
    } catch (error) {
      console.error('Erro ao parsear evento:', error);
      return null;
    }
  }

  async stop() {
    console.log('Parando Indexer...');
    this.isRunning = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    await prisma.$disconnect();
    console.log('Indexer parado');
  }
}