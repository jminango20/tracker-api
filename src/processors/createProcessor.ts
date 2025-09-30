import { BaseOperationProcessor } from './baseProcessor';
import type { AssetOperationEventData } from '../types/databaseTypes';

export class CreateProcessor extends BaseOperationProcessor {
  async process(event: AssetOperationEventData): Promise<void> {
    // Converter timestamp do blockchain (segundos) para Date
    const createdAt = new Date(Number(event.blockTimestamp) * 1000);

    await this.upsertAsset({
      assetId: event.assetId,
      channelName: event.channelName,
      ownerAddress: event.ownerAddress,
      amount: event.amount,
      idLocal: event.idLocal,
      dataHash: event.dataHash,
      status: event.status,
      originOwner: event.ownerAddress,
      parentAssetId: null, // CREATE não tem pai
      createdAt: createdAt,
    });

    console.log(`CREATE processado - Asset: ${event.assetId}`);
  }
}