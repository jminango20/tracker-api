export interface TransactionRequest {
    processId: string;
    natureId: string;
    stageId: string;
    channelName: string;
    targetAssetIds: string[];
    operationData: OperationData;
}

export interface OperationData {
    // CREATE_ASSET
    amount?: number;
    idLocal?: string;
    dataHash?: string;
    
    // TRANSFER_ASSET
    newOwner?: string;
    
    // SPLIT_ASSET
    amounts?: number[];
    
    // TRANSFORM_ASSET
    newAssetId?: string;
}