import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class GroupProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    const groupId = event.assetId;
    const parentIds = event.relatedAssetIds;
    const parentAmounts = event.relatedAmounts;

    // 1. Criar asset do grupo (filho de múltiplos pais)
    const createdAt = new Date(Number(event.blockTimestamp) * 1000);
    
    await this.upsertAsset({
      assetId: groupId,
      channelName: event.channelName,
      ownerAddress: event.ownerAddress,
      amount: event.amount,
      idLocal: event.idLocal,
      dataHash: event.dataHash,
      status: 0, // ACTIVE
      parentAssetId: null, // GROUP não tem pai único
      createdAt: createdAt,
    });

    // 2. Para cada pai: inativar + criar relação múltipla + atualizar hierarquia
    for (let i = 0; i < parentIds.length; i++) {
      // Inativar pai
      await this.prisma.asset.update({
        where: { assetId: parentIds[i] },
        data: {
          status: 1, // INACTIVE
          lastUpdated: new Date(),
        },
      });

      // Criar relação múltipla (AssetParentRelation)
      await this.prisma.assetParentRelation.create({
        data: {
          parentAssetId: parentIds[i],
          childAssetId: groupId,
          operationEventId: event.id,
          contributedAmount: parentAmounts[i],
        },
      });

      // Atualizar hierarquia
      await this.updateHierarchyPaths(parentIds[i], groupId);
    }

    console.log(`GROUP processado - ${parentIds.length} pais → ${groupId}`);
  }
}