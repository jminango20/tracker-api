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