import { prisma } from '../database/prismaClient';
import { AssetEventForDatabase, AssetOperation } from '../types/blockchainTypes';

export class EventRepository {

  /**
   * Salvar evento bruto do blockchain
   */
  async saveAssetOperationEvent(eventData: AssetEventForDatabase) {
    try {
      const event = await prisma.assetOperationEvent.create({
        data: {
          channelName: eventData.channelName,
          assetId: eventData.assetId,
          operation: eventData.operation,
          status: eventData.status,
          blockTimestamp: eventData.blockTimestamp,
          relatedAssetIds: eventData.relatedAssetIds,
          relatedAmounts: eventData.relatedAmounts,
          ownerAddress: eventData.ownerAddress,
          idLocal: eventData.idLocal,
          amount: eventData.amount,
          dataHash: eventData.dataHash,
          transactionHash: eventData.transactionHash,
          blockNumber: eventData.blockNumber,
          logIndex: eventData.logIndex,
          processed: false, // Marca para processamento posterior
        },
      });

      console.log(
        `Evento salvo - Asset: ${eventData.assetId} - TX: ${eventData.transactionHash.substring(0, 10)}...`
      );

      return event;
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `Evento já existe - TX: ${eventData.transactionHash.substring(0, 10)}... - Ignorando`
        );
        return null;
      }

      console.error('Erro ao salvar evento:', error);
      throw error;
    }
  }

  /**
   * Buscar eventos não processados de um range de blocos
   */
  async getUnprocessedEvents(fromBlock: bigint, toBlock: bigint) {
    return await prisma.assetOperationEvent.findMany({
      where: {
        blockNumber: {
          gte: fromBlock,
          lte: toBlock,
        },
        processed: false,
      },
      orderBy: [{ blockNumber: 'asc' }, { logIndex: 'asc' }],
    });
  }

  /**
   * Marcar evento como processado
   */
  async markAsProcessed(eventId: number) {
    return await prisma.assetOperationEvent.update({
      where: { id: eventId },
      data: { processed: true },
    });
  }

  /**
   * Buscar eventos por asset 
   */
  async getEventsByAsset(assetId: string) {
    return await prisma.assetOperationEvent.findMany({
      where: {
        OR: [
          { assetId: assetId },
          { relatedAssetIds: { has: assetId } },
        ],
      },
      orderBy: [{ blockNumber: 'desc' }, { logIndex: 'desc' }],
    });
  }

  /**
   * Buscar evento por transação
   */
  async getEventByTransaction(transactionHash: string, logIndex: number) {
    return await prisma.assetOperationEvent.findUnique({
      where: {
        transactionHash_logIndex: {
          transactionHash,
          logIndex,
        },
      },
    });
  }

  /**
   * Buscar eventos de um bloco específico
   */
  async getEventsByBlock(blockNumber: bigint) {
    return await prisma.assetOperationEvent.findMany({
      where: { blockNumber },
      orderBy: { logIndex: 'asc' },
    });
  }

  /**
   * Contar eventos não processados
   */
  async countUnprocessedEvents() {
    return await prisma.assetOperationEvent.count({
      where: { processed: false },
    });
  }
}