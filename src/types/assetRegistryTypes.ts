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
export interface BasicAsset {
    assetId: string;
    channelName: string;
    owner: string;
    amount: number;
    idLocal: string;
    status: string;
    operation: string;
    createdAt: number;
    lastUpdated: number;
}

export interface AssetDetails extends BasicAsset {
    dataHash: string;
    originOwner: string;
    groupedBy: string;
    groupedAssetsId: string[];
    parentAssetId: string;
    transformationId: string;
}