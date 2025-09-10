import { keccak256, toHex } from 'viem';
import { BlockchainService } from './base/blockchainService';
import { AddressDiscoveryService } from './addressDiscoveryService';
import { IPROCESS_REGISTRY_ABI } from '../config/abis/IProcessRegistry';
import { ApiResponse } from '../types/apiTypes';
import { 
    ProcessAction, 
    ProcessStatus, 
    SchemaReference, 
    ProcessInput,
    Process
} from '../types/processRegistryTypes';
import { ContractErrorHandler } from '../errors/contractErrorHandler';

export class ProcessRegistryService extends BlockchainService {
    private addressDiscoveryService: AddressDiscoveryService;
    private cachedContractAddress: `0x${string}` | null = null;
    
    protected contractAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
    protected contractAbi = [...IPROCESS_REGISTRY_ABI];

    constructor() {
        super();
        this.addressDiscoveryService = new AddressDiscoveryService();
    }

    private async ensureContractAddress(): Promise<void> {
        if (this.cachedContractAddress) {
            return;
        }

        const result = await this.addressDiscoveryService.getAddress('PROCESS_REGISTRY');
        
        if (!result.success || !result.data?.addressContract) {
            throw new Error('ProcessRegistry não encontrado no AddressDiscovery');
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

    // Criar processo
    async createProcess(processInput: ProcessInput, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Criando processo: ${processInput.processId} no canal: ${processInput.channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);

            const actionValue = this.convertActionStringToNumber(processInput.action);

            const schemas = processInput.schemas.map(schema => ({
                schemaId: this.stringToBytes32(schema.schemaId),
                version: schema.version
            }));

            const processData = {
                processId: this.stringToBytes32(processInput.processId),
                natureId: this.stringToBytes32(processInput.natureId),
                stageId: this.stringToBytes32(processInput.stageId),
                schemas: schemas,
                action: actionValue,
                description: processInput.description,
                channelName: this.stringToBytes32(processInput.channelName)
            };

            const txHash = await contract.write.createProcess([processData]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    processId: processInput.processId,
                    natureId: processInput.natureId,
                    stageId: processInput.stageId,
                    action: processInput.action,
                    channelName: processInput.channelName,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Processo criado com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'criar processo');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Alterar status do processo
    async setProcessStatus(
        channelName: string, 
        processId: string, 
        natureId: string, 
        stageId: string, 
        newStatus: string, 
        privateKey: string
    ): Promise<ApiResponse<any>> {
        try {
            const statusValue = this.convertStatusStringToNumber(newStatus);

            console.log(`Alterando status do processo: ${processId} para ${newStatus}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);
            const processIdHash = this.stringToBytes32(processId);
            const natureIdHash = this.stringToBytes32(natureId);
            const stageIdHash = this.stringToBytes32(stageId);

            const txHash = await contract.write.setProcessStatus([
                channelHash,
                processIdHash,
                natureIdHash,
                stageIdHash,
                statusValue
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    processId,
                    natureId,
                    stageId,
                    channelName,
                    newStatus,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: `Status do processo alterado para ${newStatus} com sucesso`
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'alterar status do processo');

            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Inativar processo
    async inactivateProcess(
        channelName: string, 
        processId: string, 
        natureId: string, 
        stageId: string, 
        privateKey: string
    ): Promise<ApiResponse<any>> {
        try {
            console.log(`Inativando processo: ${processId} nature: ${natureId} stage: ${stageId}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);
            const processIdHash = this.stringToBytes32(processId);
            const natureIdHash = this.stringToBytes32(natureId);
            const stageIdHash = this.stringToBytes32(stageId);

            const txHash = await contract.write.inactivateProcess([
                channelHash,
                processIdHash,
                natureIdHash,
                stageIdHash
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    processId,
                    natureId,
                    stageId,
                    channelName,
                    status: 'INACTIVE',
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Processo inativado com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'inativar processo');
                        
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Obter processo
    async getProcess(channelName: string, processId: string, natureId: string, stageId: string): Promise<ApiResponse<Process>> {
        try {
            console.log(`Buscando processo: ${processId} nature: ${natureId} stage: ${stageId} no canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);
            const processIdHash = this.stringToBytes32(processId);
            const natureIdHash = this.stringToBytes32(natureId);
            const stageIdHash = this.stringToBytes32(stageId);

            const result = await contract.read.getProcess([
                channelHash,
                processIdHash,
                natureIdHash,
                stageIdHash
            ]) as any;

            const schemas: SchemaReference[] = result.schemas.map((schema: any) => ({
                schemaId: schema.schemaId,
                version: Number(schema.version)
            }));

            const process: Process = {
                processId: processId,
                natureId: natureId,
                stageId: stageId,
                schemas: schemas,
                action: this.getActionName(Number(result.action) as ProcessAction),
                description: result.description as string,
                owner: result.owner as string,
                channelName: channelName,
                status: this.getStatusName(Number(result.status) as ProcessStatus),
                createdAt: result.createdAt.toString(),
                lastUpdated: result.lastUpdated.toString()
            };

            console.log(`Processo encontrado - status: ${process.status}, action: ${process.action}`);

            return {
                success: true,
                data: process,
                message: 'Processo obtido com sucesso'
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

    // validateProcessForSubmission
    async validateProcessForSubmission(
        channelName: string, 
        processId: string, 
        natureId: string, 
        stageId: string
    ): Promise<ApiResponse<any>> {
        try {
            console.log(`Validando processo para submissão: ${processId} nature: ${natureId} stage: ${stageId}`);

            await this.ensureContractAddress();

            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);
            const processIdHash = this.stringToBytes32(processId);
            const natureIdHash = this.stringToBytes32(natureId);
            const stageIdHash = this.stringToBytes32(stageId);

            const result = await contract.read.validateProcessForSubmission([
                channelHash,
                processIdHash,
                natureIdHash,
                stageIdHash
            ]) as any;

            const [isValid, reason] = result;

            console.log(`Validação: ${isValid}, Razão: ${reason}`);

            return {
                success: true,
                data: {
                    processId,
                    natureId,
                    stageId,
                    channelName,
                    isValid: Boolean(isValid),
                    reason: reason as string,
                    message: Boolean(isValid) ? 'Processo válido para submissão' : 'Processo não válido para submissão'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'validar processo para submissão');
                    
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    /**
     * HELER FUNCTIONS
     */
    private convertActionStringToNumber(actionString: string): number {
        const actionKey = actionString.toUpperCase().replace(' ', '_') as keyof typeof ProcessAction;
        
        if (!(actionKey in ProcessAction)) {
            throw new Error(`Action inválida: ${actionString}`);
        }
        
        return ProcessAction[actionKey];
    }

    private getActionName(action: ProcessAction): string {
        switch (action) {
            case ProcessAction.CREATE_ASSET: return 'CREATE_ASSET';
            case ProcessAction.UPDATE_ASSET: return 'UPDATE_ASSET';
            case ProcessAction.TRANSFER_ASSET: return 'TRANSFER_ASSET';
            case ProcessAction.SPLIT_ASSET: return 'SPLIT_ASSET';
            case ProcessAction.GROUP_ASSET: return 'GROUP_ASSET';
            case ProcessAction.UNGROUP_ASSET: return 'UNGROUP_ASSET';
            case ProcessAction.TRANSFORM_ASSET: return 'TRANSFORM_ASSET';
            case ProcessAction.INACTIVATE_ASSET: return 'INACTIVATE_ASSET';
            case ProcessAction.CREATE_DOCUMENT: return 'CREATE_DOCUMENT';
            default: return 'UNKNOWN';
        }
    }

    private getStatusName(status: ProcessStatus): string {
        switch (status) {
            case ProcessStatus.ACTIVE: return 'ACTIVE';
            case ProcessStatus.INACTIVE: return 'INACTIVE';
            default: return 'UNKNOWN';
        }
    }

    private convertStatusStringToNumber(statusString: string): number {
        const statusKey = statusString.toUpperCase() as keyof typeof ProcessStatus;
        
        if (!(statusKey in ProcessStatus)) {
            throw new Error(`Status inválido: ${statusString}`);
        }
        
        return ProcessStatus[statusKey];
    }
}