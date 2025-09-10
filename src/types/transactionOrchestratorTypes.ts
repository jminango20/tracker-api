export interface TransactionRequest {
    processId: string;
    natureId: string;
    stageId: string;
    channelName: string;
    targetAssetIds: string[];
    operationData: OperationData;
    dataHash: string;
    dataHashes: string[];
    description: string;
}

export interface OperationData {
    // CREATE_ASSET
    initialAmount?: number;
    initialLocation?: string;
    
    // TRANSFER_ASSET
    targetOwner?: string;
    externalId?: string;
    
    // SPLIT_ASSET
    splitAmounts?: number[];
    
    // TRANSFORM_ASSET
    newAssetId?: string;
    
    // Common
    newLocation?: string;
    newAmount?: number;
}