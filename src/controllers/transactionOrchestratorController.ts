import { Request, Response } from 'express';
import { TransactionOrchestratorService } from '../services/transactionOrchestratorService';
import { ContractValidators } from '../validators/contractValidators';
import { ResponseHelper } from '../utils/responseHelper';

export class TransactionOrchestratorController {
    private transactionOrchestratorService: TransactionOrchestratorService;

    constructor() {
        this.transactionOrchestratorService = new TransactionOrchestratorService();
    }

    // Submeter transação
    async submitTransaction(req: Request, res: Response) {
        try {
            const transactionRequest = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const requestValidation = ContractValidators.validateTransactionRequest(transactionRequest);
            if (!requestValidation.isValid) {
                return ResponseHelper.sendValidationError(res, requestValidation.error!);
            }

            console.log(`Requisição para submeter transação: ${transactionRequest.processId} nature: ${transactionRequest.natureId} stage: ${transactionRequest.stageId}`);

            // Preparar dados da transação
            const request = {
                processId: transactionRequest.processId.trim(),
                natureId: transactionRequest.natureId.trim(),
                stageId: transactionRequest.stageId.trim(),
                channelName: transactionRequest.channelName.trim(),
                targetAssetIds: transactionRequest.targetAssetIds || [],
                operationData: {
                    initialAmount: transactionRequest.operationData?.initialAmount,
                    initialLocation: transactionRequest.operationData?.initialLocation?.trim(),
                    targetOwner: transactionRequest.operationData?.targetOwner?.trim(),
                    externalId: transactionRequest.operationData?.externalId?.trim(),
                    splitAmounts: transactionRequest.operationData?.splitAmounts || [],
                    newAssetId: transactionRequest.operationData?.newAssetId?.trim(),
                    newLocation: transactionRequest.operationData?.newLocation?.trim(),
                    newAmount: transactionRequest.operationData?.newAmount
                },
                dataHash: transactionRequest.dataHash?.trim() || '',
                dataHashes: transactionRequest.dataHashes || [],
                description: transactionRequest.description?.trim() || ''
            };

            const result = await this.transactionOrchestratorService.submitTransaction(
                request,
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller submitTransaction:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}