import { keccak256, toHex } from 'viem';
import { BlockchainService } from './base/blockchainService';
import { AddressDiscoveryService } from './addressDiscoveryService';
import { ProcessRegistryService } from './processRegistryService';
import { ITRANSACTION_ORCHESTRATOR_ABI } from '../config/abis/ITransactionOrchestrator';
import { ApiResponse } from '../types/apiTypes';
import { TransactionRequest } from '../types/transactionOrchestratorTypes';
import { TransactionRequestValidator } from '../validators/transactionRequestValidator';
import { EventParsingService } from '../utils/eventParsingService';
import { ContractErrorHandler } from '../errors/contractErrorHandler';

export class TransactionOrchestratorService extends BlockchainService {
    private addressDiscoveryService: AddressDiscoveryService;
    private processRegistryService: ProcessRegistryService;
    private cachedContractAddress: `0x${string}` | null = null;
    private cachedAssetRegistryAddress: `0x${string}` | null = null;
    
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

    private async ensureAssetRegistryAddress(): Promise<string> {
        if (this.cachedAssetRegistryAddress) {
            return this.cachedAssetRegistryAddress;
        }

        const result = await this.addressDiscoveryService.getAddress('ASSET_REGISTRY');
        
        if (!result.success || !result.data?.addressContract) {
            throw new Error('AssetRegistry não encontrado no AddressDiscovery');
        }

        this.cachedAssetRegistryAddress = result.data.addressContract as `0x${string}`;
        console.log('AssetRegistry address cached:', this.cachedAssetRegistryAddress); // Debug
        return this.cachedAssetRegistryAddress;
    }

    private stringToBytes32(str: string): `0x${string}` {
        return keccak256(toHex(str));
    }


    // Método principal
    async submitTransaction(request: TransactionRequest, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Submetendo transação: ${request.processId} - action será validada dinamicamente`);

            // 1. Obter action do processo
            const processResult = await this.processRegistryService.getProcess(
                request.channelName,
                request.processId,
                request.natureId,
                request.stageId
            );

            if (!processResult.success) {
                return {
                    success: false,
                    error: 'Processo não encontrado'
                };
            }

            const action = processResult.data?.action;
            if (!action) {
                return {
                    success: false,
                    error: 'Action do processo não identificada'
                };
            }

            // 2. Validação dinâmica baseada na action do processo
            const validation = TransactionRequestValidator.validateByAction(action, request);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error!
                };
            }

            await this.ensureContractAddress();
            await this.ensureAssetRegistryAddress();

            const contract = this.getWriteContract(privateKey);

            // 3. Preparar request para o contrato
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

            console.log('Enviando transação para o contrato...');

            // 4. Executar transação
            const txHash = await contract.write.submitTransaction([contractRequest]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            const eventParser = new EventParsingService(this.cachedAssetRegistryAddress!);

            const parsedData = eventParser.parseTransactionEvents(receipt, action);

            const responseData = {
                processId: request.processId,
                natureId: request.natureId,
                stageId: request.stageId,
                channelName: request.channelName,
                process: action,
                transactionHash: txHash,
                assets: parsedData.events,                
                blockNumber: receipt.blockNumber?.toString() || '0',
                gasUsed: receipt.gasUsed?.toString() || '0',                
            };

            return {
                success: true,
                data: responseData
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);    
            const errorInfo = contractError || this.handleBlockchainError(error, 'submeter transação');

            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    public clearAddressCache(): void {
        this.cachedContractAddress = null;
    }
}