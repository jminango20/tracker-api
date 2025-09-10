// Enums
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

// Interfaces
export interface Asset {
    assetId: string;
    channelName: string;
    owner: string;
    location: string, 
    amount: number;
    dataHash: string;
    status: string;
    operation: string;
    createdAt: string;
    lastUpdated: string;
    groupedAssets: string[];    
    groupedBy: string;
    originOwner: string;
    externalId: string;
    parentAssetId: string;   
    transformationId: string;
    childAssets: string[];  
}