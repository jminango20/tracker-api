import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class InactivateProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    // Verificar se asset existe
    const assetExists = await this.assetExists(event.assetId);
    
    if (!assetExists) {
      throw new Error(`INACTIVATE failed: Asset ${event.assetId} não existe`);
    }

    // Inativar o asset
    await this.prisma.asset.update({
      where: { assetId: event.assetId },
      data: {
        status: 1, // INACTIVE
        idLocal: event.idLocal, // Pode atualizar localização final
        lastUpdated: new Date(),
      },
    });

    console.log(`INACTIVATE processado - Asset: ${event.assetId}`);
  }
}