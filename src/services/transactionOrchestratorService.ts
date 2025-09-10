import { keccak256, parseAbiItem, toHex, decodeEventLog } from 'viem';
import { BlockchainService } from './base/blockchainService';
import { AddressDiscoveryService } from './addressDiscoveryService';
import { ProcessRegistryService } from './processRegistryService';
import { ITRANSACTION_ORCHESTRATOR_ABI } from '../config/abis/ITransactionOrchestrator';
import { ApiResponse } from '../types/apiTypes';
import { 
    TransactionRequest
 } from '../types/transactionOrchestratorTypes';

export class TransactionOrchestratorService extends BlockchainService {
    private addressDiscoveryService: AddressDiscoveryService;
    private processRegistryService: ProcessRegistryService;
    private cachedContractAddress: `0x${string}` | null = null;
    
    protected contractAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
    protected contractAbi = [...ITRANSACTION_ORCHESTRATOR_ABI];

    constructor() {
        super();
        this.addressDiscoveryService = new AddressDiscoveryService();
        this.processRegistryService = new ProcessRegistryService();
    }

    private async ensureContractAddress(): Promise<void> {
        if (this.cachedContractAddress) {
            return;
        }

        const result = await this.addressDiscoveryService.getAddress('TRANSACTION_ORCHESTRATOR');
        
        if (!result.success || !result.data?.addressContract) {
            throw new Error('TransactionOrchestrator não encontrado no AddressDiscovery');
        }

        this.cachedContractAddress = result.data.addressContract as `0x${string}`;
        this.contractAddress = this.cachedContractAddress;
    }

    private stringToBytes32(str: string): `0x${string}` {
        return keccak256(toHex(str));
    }

    private async validateRequestByAction(request: TransactionRequest): Promise<{ isValid: boolean; error?: string }> {
        // 1. Consultar o processo para obter a action
        const processResult = await this.processRegistryService.getProcess(
            request.channelName,
            request.processId,
            request.natureId,
            request.stageId
        );

        if (!processResult.success) {
            return { isValid: false, error: 'Processo não encontrado' };
        }

        const action = processResult.data?.action;
        if (!action) {
            return { isValid: false, error: 'Action do processo não identificada' };
        }

        // 2. Validar campos baseado na action
        switch (action) {
            case 'CREATE_ASSET':
                return this.validateCreateAsset(request);
            
            case 'UPDATE_ASSET':
                return this.validateUpdateAsset(request);
            
            case 'TRANSFER_ASSET':
                return this.validateTransferAsset(request);
            
            case 'SPLIT_ASSET':
                return this.validateSplitAsset(request);
            
            case 'GROUP_ASSET':
                return this.validateGroupAsset(request);
            
            case 'UNGROUP_ASSET':
                return this.validateUngroupAsset(request);
            
            case 'TRANSFORM_ASSET':
                return this.validateTransformAsset(request);
            
            case 'INACTIVATE_ASSET':
                return this.validateInactivateAsset(request);
            
            case 'CREATE_DOCUMENT':
                return this.validateCreateDocument(request);
            
            default:
                return { isValid: false, error: `Action '${action}' não suportada` };
        }
    }

    // Validações específicas por action
    private validateCreateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length > 0) {
            return { isValid: false, error: 'CREATE_ASSET não deve ter targetAssetIds' };
        }
        
        if (!request.operationData.initialAmount || request.operationData.initialAmount <= 0) {
            return { isValid: false, error: 'initialAmount é obrigatório para CREATE_ASSET' };
        }
        
        if (!request.operationData.initialLocation) {
            return { isValid: false, error: 'initialLocation é obrigatório para CREATE_ASSET' };
        }
        
        if (!request.dataHash) {
            return { isValid: false, error: 'dataHash é obrigatório para CREATE_ASSET' };
        }
        
        return { isValid: true };
    }

    private validateUpdateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'UPDATE_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.newLocation && !request.operationData.newAmount && !request.dataHash) {
            return { isValid: false, error: 'UPDATE_ASSET deve ter pelo menos newLocation, newAmount ou dataHash' };
        }
        
        return { isValid: true };
    }

    private validateTransferAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'TRANSFER_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.targetOwner) {
            return { isValid: false, error: 'targetOwner é obrigatório para TRANSFER_ASSET' };
        }
        
        return { isValid: true };
    }

    private validateSplitAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'SPLIT_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.splitAmounts || request.operationData.splitAmounts.length < 2) {
            return { isValid: false, error: 'splitAmounts deve ter pelo menos 2 valores para SPLIT_ASSET' };
        }
        
        if (!request.dataHashes || request.dataHashes.length !== request.operationData.splitAmounts.length) {
            return { isValid: false, error: 'dataHashes deve ter o mesmo tamanho que splitAmounts' };
        }
        
        return { isValid: true };
    }

    private validateGroupAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length < 2) {
            return { isValid: false, error: 'GROUP_ASSET deve ter pelo menos 2 targetAssetIds' };
        }
        
        return { isValid: true };
    }

    private validateUngroupAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'UNGROUP_ASSET deve ter exatamente 1 targetAssetId (grupo)' };
        }
        
        return { isValid: true };
    }

    private validateTransformAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'TRANSFORM_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.newAssetId) {
            return { isValid: false, error: 'newAssetId é obrigatório para TRANSFORM_ASSET' };
        }
        
        return { isValid: true };
    }

    private validateInactivateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'INACTIVATE_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        return { isValid: true };
    }

    private validateCreateDocument(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length > 0) {
            return { isValid: false, error: 'CREATE_DOCUMENT não deve ter targetAssetIds' };
        }
        
        if (!request.dataHash) {
            return { isValid: false, error: 'dataHash é obrigatório para CREATE_DOCUMENT' };
        }
        
        return { isValid: true };
    }

    // Método principal
    async submitTransaction(request: TransactionRequest, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Submetendo transação: ${request.processId} - action será validada dinamicamente`);

            // 1. Validação dinâmica baseada na action do processo
            const validation = await this.validateRequestByAction(request);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error!
                };
            }

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);

            /*
            const processResult = await this.processRegistryService.getProcess(
                request.channelName,
                request.processId,
                request.natureId,
                request.stageId
            );

            const action = processResult.data?.action;
            console.log("AQUI", action);

            let operationData: any;

            switch (action) {
                case 'CREATE_ASSET':
                    operationData = {
                        initialAmount: BigInt(request.operationData.initialAmount || 0),
                        initialLocation: request.operationData.initialLocation || '',
                        targetOwner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
                        externalId: '',
                        splitAmounts: [],
                        newAssetId: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
                        newLocation: '',
                        newAmount: BigInt(0)
                    };
                    break;
                    
                case 'UPDATE_ASSET':
                    console.log("ENTRO");
                    operationData = {
                        initialAmount: BigInt(0),
                        initialLocation: '',
                        targetOwner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
                        externalId: '',
                        splitAmounts: [],
                        newAssetId: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
                        newLocation: request.operationData.newLocation || '',
                        newAmount: BigInt(request.operationData.newAmount || 0)
                    };
                    break;
                    
                case 'TRANSFER_ASSET':
                    operationData = {
                        initialAmount: BigInt(0),
                        initialLocation: '',
                        targetOwner: (request.operationData.targetOwner || '0x0000000000000000000000000000000000000000') as `0x${string}`,
                        externalId: request.operationData.externalId || '',
                        splitAmounts: [],
                        newAssetId: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
                        newLocation: '',
                        newAmount: BigInt(0)
                    };
                    break;
                    
                // ... outras actions
                
                default:
                    return {
                        success: false,
                        error: `Action '${action}' não implementada`
                    };
            }
            

            const contractRequest = {
                processId: this.stringToBytes32(request.processId),
                natureId: this.stringToBytes32(request.natureId),
                stageId: this.stringToBytes32(request.stageId),
                channelName: this.stringToBytes32(request.channelName),
                targetAssetIds: request.targetAssetIds,
                operationData, // Usar o operationData específico
                dataHash: request.dataHash ? this.stringToBytes32(request.dataHash) : '0x0000000000000000000000000000000000000000000000000000000000000000',
                dataHashes: request.dataHashes?.map(hash => this.stringToBytes32(hash)) || [],
                description: request.description || ''
            };

            */

            const contractRequest = {
                processId: this.stringToBytes32(request.processId),
                natureId: this.stringToBytes32(request.natureId),
                stageId: this.stringToBytes32(request.stageId),
                channelName: this.stringToBytes32(request.channelName),
                targetAssetIds: request.targetAssetIds,
                operationData: {
                    initialAmount: request.operationData.initialAmount || 0,
                    initialLocation: request.operationData.initialLocation || '',
                    targetOwner: request.operationData.targetOwner || '0x0000000000000000000000000000000000000000',
                    externalId: request.operationData.externalId || '',
                    splitAmounts: request.operationData.splitAmounts || [],
                    newAssetId: request.operationData.newAssetId ? this.stringToBytes32(request.operationData.newAssetId) : '0x0000000000000000000000000000000000000000000000000000000000000000',
                    newLocation: request.operationData.newLocation || '',
                    newAmount: request.operationData.newAmount || 0
                },
                dataHash: request.dataHash ? this.stringToBytes32(request.dataHash) : '0x0000000000000000000000000000000000000000000000000000000000000000',
                dataHashes: request.dataHashes.map(hash => this.stringToBytes32(hash)),
                description: request.description || ''
            };

            console.log(contractRequest);

            const txHash = await contract.write.submitTransaction([contractRequest]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            const affectedAssets = this.parseAffectedAssetsFromReceipt(receipt);

            //const operationEvent = contract.watchEvent.OperationExecuted({}, { onLogs: (logs) => console.log(logs) });
            //console.log(operationEvent);

            return {
                success: true,
                data: {
                    processId: request.processId,
                    natureId: request.natureId,
                    stageId: request.stageId,
                    affectedAssets,
                    channelName: request.channelName,
                    targetAssetIds: request.targetAssetIds,
                    //newAssetId: this.stringToBytes32(request.operationData.newAssetId!),
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Transação submetida com sucesso'
                }
            };

        } catch (error) {
            const errorInfo = this.handleBlockchainError(error, 'submeter transação');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    public clearAddressCache(): void {
        this.cachedContractAddress = null;
    }

    private parseAffectedAssetsFromReceipt(receipt: any): string[] {
        try {
            const operationLogs = receipt.logs.filter((log: any) => {
                return log.address.toLowerCase() === this.contractAddress.toLowerCase();
            });

            for (const log of operationLogs) {
                try {
                    // Decodificar usando parseAbiItem
                    const decodedLog = decodeEventLog({
                        abi: [parseAbiItem('event OperationExecuted(bytes32 indexed channelName, bytes32 indexed processId, bytes32 natureId, bytes32 stageId, address operator, bytes32[] affectedAssets, uint8 operation, uint256 indexed blockNumber, uint256 timestamp)')],
                        data: log.data,
                        topics: log.topics,
                    });

                    return decodedLog.args.affectedAssets.map((assetId: any) => assetId as string);
                } catch (decodeError) {
                    continue;
                }
            }
            return [];
        } catch (error) {
            console.warn('Erro ao parsear logs do receipt:', error);
            return [];
        }
    }
}