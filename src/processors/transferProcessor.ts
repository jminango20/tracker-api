import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class TransferProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    // Verificar se asset existe
    const assetExists = await this.assetExists(event.assetId);
    
    if (!assetExists) {
      throw new Error(`TRANSFER failed: Asset ${event.assetId} não existe`);
    }

    // Atualizar ownership e localização
    await this.prisma.asset.update({
      where: { assetId: event.assetId },
      data: {
        ownerAddress: event.ownerAddress,  // Novo dono
        idLocal: event.idLocal,            // Nova localização
        dataHash: event.dataHash,          // Pode atualizar hash também
        lastUpdated: new Date(),
      },
    });

    console.log(`TRANSFER processado - Asset: ${event.assetId} - Novo owner: ${event.ownerAddress}`);
  }
}