import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class UngroupProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    const groupAssetId = event.assetId;
    const ungroupedAssetIds = event.relatedAssetIds; // Assets que serão reativados

    // Verificar se grupo existe
    const groupExists = await this.assetExists(groupAssetId);
    if (!groupExists) {
      throw new Error(`UNGROUP failed: Grupo ${groupAssetId} não existe`);
    }

    // 1. Inativar o asset do grupo
    await this.prisma.asset.update({
      where: { assetId: groupAssetId },
      data: {
        status: 1, // INACTIVE
        lastUpdated: new Date(),
      },
    });

    // 2. Reativar os assets que estavam agrupados
    for (let i = 0; i < ungroupedAssetIds.length; i++) {
      const ungroupedId = ungroupedAssetIds[i];

      await this.prisma.asset.update({
        where: { assetId: ungroupedId },
        data: {
          status: 0, // ACTIVE
          idLocal: event.idLocal, // Nova localização
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`UNGROUP processado - Grupo ${groupAssetId} inativado, ${ungroupedAssetIds.length} assets reativados`);
  }
}