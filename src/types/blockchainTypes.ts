export enum AssetOperation {
  CREATE = 0,
  UPDATE = 1,
  TRANSFER = 2,
  TRANSFERIN = 3,
  SPLIT = 4,
  GROUP = 5,
  UNGROUP = 6,
  TRANSFORM = 7,
  INACTIVATE = 8,
  CREATE_DOCUMENT = 9,
  DATA_SHEET_ASSET = 10,
  PARTIALLY_CONSUMED_ASSET = 11
}

export enum AssetStatus {
  ACTIVE = 0,
  INACTIVE = 1
}

// Evento bruto vindo do blockchain
export interface AssetOperationExecutedEvent {
  channelName: string;      // bytes32 convertido
  assetId: string;          // bytes32 convertido
  operation: number;        // uint8
  status: number;           // uint8
  timestamp: bigint;        // uint256
  relatedAssetIds: string[]; // bytes32[]
  relatedAmounts: bigint[];  // uint256[]
  owner: string;            // address
  idLocal: string;          // string
  amount: bigint;           // uint256
  dataHash: string;         // bytes32
}

// Metadados da transação 
export interface EventMetadata {
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
  blockTimestamp: bigint;
}

// Evento completo com metadados
export interface CompleteAssetEvent extends AssetOperationExecutedEvent {
  metadata: EventMetadata;
}

export interface AssetEventForDatabase {
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
}

export function convertEventForDatabase(event: CompleteAssetEvent): AssetEventForDatabase {
  return {
    channelName: event.channelName,
    assetId: event.assetId,
    operation: event.operation,
    status: event.status,
    blockTimestamp: event.metadata.blockTimestamp,
    relatedAssetIds: event.relatedAssetIds,
    relatedAmounts: event.relatedAmounts.map(amt => amt.toString()),
    ownerAddress: event.owner,
    idLocal: event.idLocal || null,
    amount: event.amount.toString(),
    dataHash: event.dataHash || null,
    transactionHash: event.metadata.transactionHash,
    blockNumber: event.metadata.blockNumber,
    logIndex: event.metadata.logIndex
  };
}

// Tipos auxiliares para queries
export interface AssetHistoryQuery {
  assetId: string;
  channelName?: string;
  fromBlock?: bigint;
  toBlock?: bigint;
}

export interface BatchProcessResult {
  processed: number;
  failed: number;
  errors: Array<{
    event: AssetEventForDatabase;
    error: string;
  }>;
}