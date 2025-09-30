import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class UpdateProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    // Verificar se asset existe
    const assetExists = await this.assetExists(event.assetId);
    
    if (!assetExists) {
      throw new Error(`UPDATE failed: Asset ${event.assetId} não existe`);
    }

    // Atualizar asset existente
    await this.prisma.asset.update({
      where: { assetId: event.assetId },
      data: {
        amount: event.amount,           // Novo valor
        idLocal: event.idLocal,         // Nova localização
        dataHash: event.dataHash,       // Novo hash
        lastUpdated: new Date(),
      },
    });

    console.log(`UPDATE processado - Asset: ${event.assetId} - Novo amount: ${event.amount}`);
  }
}