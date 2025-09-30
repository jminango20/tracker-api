import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class SplitProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    const parentId = event.assetId;
    const childIds = event.relatedAssetIds;
    const childAmounts = event.relatedAmounts;

    // 1. Inativar asset pai
    await this.prisma.asset.update({
      where: { assetId: parentId },
      data: {
        status: 1, // INACTIVE
        lastUpdated: new Date(),
      },
    });

    // 2. Criar assets filhos
    const createdAt = new Date(Number(event.blockTimestamp) * 1000);
    
    for (let i = 0; i < childIds.length; i++) {
      await this.upsertAsset({
        assetId: childIds[i],
        channelName: event.channelName,
        ownerAddress: event.ownerAddress,
        amount: childAmounts[i],
        idLocal: event.idLocal,
        dataHash: event.dataHash,
        status: 0, // ACTIVE
        parentAssetId: parentId, // Cada filho tem o mesmo pai
        createdAt: createdAt,
      });

      // 3. Atualizar hierarquia para cada filho
      await this.updateHierarchyPaths(parentId, childIds[i]);
    }

    console.log(`SPLIT processado - ${parentId} → ${childIds.length} filhos`);
  }
}