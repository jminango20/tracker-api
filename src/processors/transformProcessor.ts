import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class TransformProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    const originalAssetId = event.assetId;
    const newAssetId = event.relatedAssetIds[0]; // TRANSFORM sempre gera 1 novo asset
    
    if (!newAssetId) {
      throw new Error(`TRANSFORM failed: relatedAssetIds vazio`);
    }

    // Buscar asset original para herdar dados
    const originalAsset = await this.prisma.asset.findUnique({
      where: { assetId: originalAssetId },
    });

    if (!originalAsset) {
      throw new Error(`TRANSFORM failed: Asset original ${originalAssetId} não existe`);
    }

    // 1. Inativar asset original
    await this.prisma.asset.update({
      where: { assetId: originalAssetId },
      data: {
        status: 1, // INACTIVE
        lastUpdated: new Date(),
      },
    });

    // 2. Criar novo asset transformado
    const createdAt = new Date(Number(event.blockTimestamp) * 1000);
    
    await this.upsertAsset({
      assetId: newAssetId,
      channelName: event.channelName,
      ownerAddress: event.ownerAddress,
      amount: event.relatedAmounts[0], // Novo valor
      idLocal: event.idLocal,
      dataHash: event.dataHash,
      status: 0, // ACTIVE
      originOwner: originalAsset.originOwner, // Herda originOwner
      parentAssetId: originalAssetId,         // Pai é o asset original
      createdAt: createdAt,
    });

    // 3. Atualizar hierarquia
    await this.updateHierarchyPaths(originalAssetId, newAssetId);

    console.log(`TRANSFORM processado - ${originalAssetId} → ${newAssetId}`);
  }
}