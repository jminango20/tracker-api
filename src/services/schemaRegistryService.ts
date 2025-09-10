import { keccak256, toHex } from 'viem';
import { BlockchainService } from './base/blockchainService';
import { AddressDiscoveryService } from './addressDiscoveryService';
import { ISCHEMA_REGISTRY_ABI } from '../config/abis/ISchemaRegistry';
import { 
    ApiResponse, 
    Schema,  
    SchemaInput,
    SchemaUpdateInput,
    SchemaStatus 
} from '../types/apiTypes';
import { ContractErrorHandler } from '../errors/contractErrorHandler';

export class SchemaRegistryService extends BlockchainService {
    private addressDiscoveryService: AddressDiscoveryService;
    private cachedContractAddress: `0x${string}` | null = null;
    
    protected contractAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
    protected contractAbi = [...ISCHEMA_REGISTRY_ABI];

    constructor() {
        super();
        this.addressDiscoveryService = new AddressDiscoveryService();
    }

    private async ensureContractAddress(): Promise<void> {
        if (this.cachedContractAddress) {
            return;
        }

        const result = await this.addressDiscoveryService.getAddress('SCHEMA_REGISTRY');
        
        if (!result.success || !result.data?.addressContract) {
            throw new Error('SchemaRegistry não encontrado no AddressDiscovery');
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

    // Criar schema
    async createSchema(schemaInput: SchemaInput, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Criando schema: ${schemaInput.name} no canal: ${schemaInput.channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);

            const schemaData = {
                id: this.stringToBytes32(schemaInput.schemaId),
                name: schemaInput.name,
                dataHash: this.stringToBytes32(schemaInput.dataHash),
                channelName: this.stringToBytes32(schemaInput.channelName),
                description: schemaInput.description
            };

            const txHash = await contract.write.createSchema([schemaData]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    schemaId: schemaInput.schemaId,
                    schemaName: schemaInput.name,
                    channelName: schemaInput.channelName,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Schema criado com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError ||this.handleBlockchainError(error, 'criar schema');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Atualizar schema
    async updateSchema(schemaUpdate: SchemaUpdateInput, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Atualizando schema: ${schemaUpdate.schemaId} no canal: ${schemaUpdate.channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);

            const updateData = {
                id: this.stringToBytes32(schemaUpdate.schemaId),
                newDataHash: this.stringToBytes32(schemaUpdate.newDataHash),
                channelName: this.stringToBytes32(schemaUpdate.channelName),
                description: schemaUpdate.newDescription
            };

            const txHash = await contract.write.updateSchema([updateData]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    schemaId: schemaUpdate.schemaId,
                    channelName: schemaUpdate.channelName,
                    newDataHash: schemaUpdate.newDataHash,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Schema atualizado com sucesso - nova versão criada'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'atualizar schema');
                        
            return {
                success: false,
                error: errorInfo.message
            };
        }
    };

    // Depreciar schema
    async deprecateSchema(schemaId: string, channelName: string, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Depreciando schema: ${schemaId} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);

            const schemaIdHash = this.stringToBytes32(schemaId);
            const channelHash = this.stringToBytes32(channelName);

            const txHash = await contract.write.deprecateSchema([schemaIdHash, channelHash]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    schemaId: schemaId,
                    channelName: channelName,
                    status: 'DEPRECATED',
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Schema depreciado com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'depreciar schema');

            return {
                success: false,
                error: errorInfo.message
            };
        }
    };

    // Inativar schema
    async inactivateSchema(schemaId: string, version: number, channelName: string, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Inativando schema: ${schemaId} versão ${version} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            
            const schemaIdHash = this.stringToBytes32(schemaId);
            const channelHash = this.stringToBytes32(channelName);

            const txHash = await contract.write.inactivateSchema([
                schemaIdHash,
                version,
                channelHash
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    schemaId,
                    version,
                    channelName,
                    status: 'INACTIVE',
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: `Schema versão ${version} inativado com sucesso`
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'inativar schema');
                
            return {
                success: false,
                error: errorInfo.message
            };
        }
    };

    // Atualizar status
    async setSchemaStatus(schemaId: string, version: number, channelName: string, newStatus: string, privateKey: string): Promise<ApiResponse<any>> {
        try {

            const statusValue = this.convertStatusStringToNumber(newStatus);

            console.log(`Alterando status do schema: ${schemaId} versão ${version} para ${statusValue} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const schemaIdHash = this.stringToBytes32(schemaId);
            const channelHash = this.stringToBytes32(channelName);

        
            console.log(`Status: ${statusValue}`);

            const txHash = await contract.write.setSchemaStatus([
                schemaIdHash,
                version,
                channelHash,
                statusValue
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    schemaId,
                    version,
                    channelName,
                    newStatus: this.getStatusName(statusValue),
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: `Status do schema alterado para ${this.getStatusName(statusValue)} com sucesso`
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'alterar status do schema');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    };

    // Obter schema por versão
    async getSchemaByVersion(channelName: string, schemaId: string, version: number): Promise<ApiResponse<Schema>> {
        try {
            console.log(`Buscando schema: ${schemaId} versão ${version} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);
            const schemaIdHash = this.stringToBytes32(schemaId);

            const result = await contract.read.getSchemaByVersion([channelHash, schemaIdHash, version]) as any;

            const schema = {
                id: schemaId,
                name: result.name as string,
                version: Number(result.version),
                dataHash: result.dataHash as string,
                owner: result.owner as string,
                channelName: channelName,
                status: this.getStatusName(Number(result.status) as SchemaStatus),
                createdAt: result.createdAt.toString(),
                updatedAt: result.updatedAt.toString(),
                description: result.description as string
            };
            
            console.log(`Schema versão ${schema.version} encontrado - status: ${schema.status}`);

            return {
                success: true,
                data: schema,
                message: `Schema versão ${version} obtido com sucesso`
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter schema por versão');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    };

    // Obter schema ativo
    async getActiveSchema(channelName: string, schemaId: string): Promise<ApiResponse<Schema>> {
        try {
            console.log(`Buscando schema ativo: ${schemaId} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);
            const schemaIdHash = this.stringToBytes32(schemaId);

            const result = await contract.read.getActiveSchema([channelHash, schemaIdHash]) as any;
            
            console.log(`Schema ativo encontrado - versão: ${result.version}, status: ${result.status}`);

            const schema: Schema = {
                id: schemaId, 
                name: result.name as string,
                version: Number(result.version),
                dataHash: result.dataHash as string, 
                owner: result.owner as string,
                channelName: channelName, // Nome original do canal
                status: this.getStatusName(result.status),
                createdAt: result.createdAt.toString(),
                updatedAt: result.updatedAt.toString(),
                description: result.description as string
            };

            return {
                success: true,
                data: schema,
                message: 'Schema ativo obtido com sucesso'
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter schema ativo');
                        
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }
          
    // Obter informações do schema
    async getSchemaInfo(channelName: string, schemaId: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Buscando informações do schema: ${schemaId} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);
            const schemaIdHash = this.stringToBytes32(schemaId);

            const result = await contract.read.getSchemaInfo([channelHash, schemaIdHash]) as any;
            const [latestVersion, activeVersion] = result;

            console.log(`Schema ${schemaId} - Última versão: ${latestVersion}, Versão ativa: ${activeVersion}`);

            return {
                success: true,
                data: {
                    schemaId,
                    channelName,
                    latestVersion: Number(latestVersion),
                    activeVersion: Number(activeVersion),
                    hasActiveVersion: Number(activeVersion) > 0,
                    message: 'Informações do schema obtidas com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter informações do schema');
                       
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    /**
     * HELPER FUNCTIONS
     */
    private getStatusName(status: SchemaStatus): string {
        switch (status) {
            case SchemaStatus.ACTIVE:
                return 'ACTIVE';
            case SchemaStatus.DEPRECATED:
                return 'DEPRECATED';
            case SchemaStatus.INACTIVE:
                return 'INACTIVE';
            default:
                return 'UNKNOWN';
        }
    }

    private convertStatusStringToNumber(statusString: string): number {
        const statusKey = statusString.toUpperCase() as keyof typeof SchemaStatus;
        
        if (!(statusKey in SchemaStatus)) {
            throw new Error(`Status inválido: ${statusString}`);
        }
        
        return SchemaStatus[statusKey];
    }
}