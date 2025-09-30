// Tipos simples baseados no que você definiu no schema
export interface AssetOperationEventData {
  id: number;
  channelName: string;
  assetId: string;
  operation: number;
  status: number;
  blockTimestamp: bigint;
  relatedAssetIds: string[];
  relatedAmounts: string[];
  ownerAddress: string;
  idLocal: string | null;
  amount: string;
  dataHash: string | null;
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
  processed: boolean;
  createdAt: Date;
}