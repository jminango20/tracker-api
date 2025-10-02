import { keccak256, toHex } from 'viem';
import { BlockchainService } from './base/blockchainService';
import { AddressDiscoveryService } from './addressDiscoveryService';
import { IASSET_REGISTRY_ABI } from '../config/abis/IAssetRegistry';
import { ApiResponse } from '../types/apiTypes';
import { 
    AssetOperation, 
    AssetStatus, 
    BasicAsset,
    AssetDetails
} from '../types/index';
import { ContractErrorHandler } from '../errors/contractErrorHandler';


export class AssetRegistryService extends BlockchainService {
    private addressDiscoveryService: AddressDiscoveryService;
    private cachedContractAddress: `0x${string}` | null = null;
    
    protected contractAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
    protected contractAbi = [...IASSET_REGISTRY_ABI];

    constructor() {
        super();
        this.addressDiscoveryService = new AddressDiscoveryService();
    }

    private async ensureContractAddress(): Promise<void> {
        if (this.cachedContractAddress) {
            return;
        }

        const result = await this.addressDiscoveryService.getAddress('ASSET_REGISTRY');
        
        if (!result.success || !result.data?.addressContract) {
            throw new Error('AssetRegistry não encontrado no AddressDiscovery');
        }

        this.cachedContractAddress = result.data.addressContract as `0x${string}`;
        this.contractAddress = this.cachedContractAddress;
    }

    private stringToBytes32(str: string): `0x${string}` {
        return keccak256(toHex(str));
    }

    public clearAddressCache(): void {
        this.cachedContractAddress = null;
    }

    // Obter asset
    async getAsset(channelName: string, assetId: string): Promise<ApiResponse<BasicAsset>> {
        try {
            console.log(`Buscando asset: ${assetId} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);

            const result = await contract.read.getAsset([
                channelHash,
                assetId
            ]) as any;

            const basicAsset: BasicAsset = {
                assetId: result.assetId,
                channelName: channelName,
                owner: result.owner as string,
                amount: Number(result.amount),
                idLocal: result.idLocal as string,
                status: this.getStatusName(Number(result.status) as AssetStatus),
                operation: this.getOperationName(Number(result.operation) as AssetOperation),
                createdAt: Number(result.createdAt),
                lastUpdated: Number(result.lastUpdated)
            };

            console.log(`Asset encontrado - status: ${basicAsset.status}, operation: ${basicAsset.operation}`);

            return {
                success: true,
                data: basicAsset,
                message: 'Asset obtido com sucesso'
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter processo');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Obter asset com detalhes
    async getAssetDetails(channelName: string, assetId: string): Promise<ApiResponse<AssetDetails>> {
        try {
            console.log(`Buscando detalhes do asset: ${assetId} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);

            const result = await contract.read.getAsset([
                channelHash,
                assetId
            ]) as any;

            const assetDetails = this.formatAssetDetails(result, channelName);

            return {
                success: true,
                data: assetDetails as AssetDetails,
                message: 'Detalhes do asset consultados com sucesso'
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'consultar detalhes do asset');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    /**
     * HELER FUNCTIONS
     */
    private getOperationName(operation: AssetOperation): string {
        switch (operation) {
            case AssetOperation.CREATE: return 'CREATE';
            case AssetOperation.UPDATE: return 'UPDATE';
            case AssetOperation.TRANSFER: return 'TRANSFER';
            case AssetOperation.TRANSFERIN: return 'TRANSFERIN';
            case AssetOperation.SPLIT: return 'SPLIT';
            case AssetOperation.GROUP: return 'GROUP';
            case AssetOperation.UNGROUP: return 'UNGROUP';
            case AssetOperation.TRANSFORM: return 'TRANSFORM';
            case AssetOperation.INACTIVATE: return 'INACTIVATE';
            case AssetOperation.CREATE_DOCUMENT: return 'CREATE_DOCUMENT';
            case AssetOperation.DATA_SHEET_ASSET: return 'DATA_SHEET_ASSET';
            case AssetOperation.PARTIALLY_CONSUMED_ASSET: return 'PARTIALLY_CONSUMED_ASSET';
            default: return 'UNKNOWN';
        }
    }

    private getStatusName(status: AssetStatus): string {
        switch (status) {
            case AssetStatus.ACTIVE: return 'ACTIVE';
            case AssetStatus.INACTIVE: return 'INACTIVE';
            default: return 'UNKNOWN';
        }
    }

    private formatAssetDetails(result: any, channelName: string): Partial<AssetDetails> {
        const assetDetails: AssetDetails = {
            assetId: result.assetId,
            channelName: channelName,
            owner: result.owner as string,
            amount: Number(result.amount),
            idLocal: result.idLocal as string,
            status: this.getStatusName(Number(result.status) as AssetStatus),
            operation: this.getOperationName(Number(result.operation) as AssetOperation),
            createdAt: Number(result.createdAt),
            lastUpdated: Number(result.lastUpdated),
            dataHash: result.dataHash as string,
            originOwner: result.originOwner as string,
            groupedBy: result.groupedBy as string,
            groupedAssetsId: (result.groupedAssets || []).map((id: any) => id.toString()),
            parentAssetId: result.parentAssetId as string,
            transformationId: result.transformationId as string
        };

        const cleaned: Partial<AssetDetails> = {};
        
        // Campos obrigatórios
        cleaned.assetId = assetDetails.assetId;
        cleaned.channelName = assetDetails.channelName;
        cleaned.owner = assetDetails.owner;
        cleaned.amount = assetDetails.amount;
        cleaned.idLocal = assetDetails.idLocal;
        cleaned.status = assetDetails.status;
        cleaned.operation = assetDetails.operation;
        cleaned.createdAt = assetDetails.createdAt;
        cleaned.lastUpdated = assetDetails.lastUpdated;
        cleaned.dataHash = assetDetails.dataHash;
        cleaned.originOwner = assetDetails.originOwner;

        // Campos opcionais
        if (assetDetails.groupedBy && !assetDetails.groupedBy.startsWith('0x0000000000000000000000000000000000000000000000000000000000000000')) {
            cleaned.groupedBy = assetDetails.groupedBy;
        }

        if (assetDetails.groupedAssetsId && assetDetails.groupedAssetsId.length > 0) {
            cleaned.groupedAssetsId = assetDetails.groupedAssetsId;
        }

        if (assetDetails.parentAssetId && !assetDetails.parentAssetId.startsWith('0x0000000000000000000000000000000000000000000000000000000000000000')) {
            cleaned.parentAssetId = assetDetails.parentAssetId;
        }

        if (assetDetails.transformationId && !assetDetails.transformationId.startsWith('0x0000000000000000000000000000000000000000000000000000000000000000')) {
            cleaned.transformationId = assetDetails.transformationId;
        }

        return cleaned;
    }
}