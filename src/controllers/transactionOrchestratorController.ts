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
            const requestBody = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            if (!this.validateBasicStructure(requestBody)) {
                return ResponseHelper.sendValidationError(res, 'Estrutura JSON inválida');
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para operação: ${requestBody.process.stageId}`);

            const result = await this.transactionOrchestratorService.submitTransaction(
                requestBody,
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

    private validateBasicStructure(body: any): boolean {
        return body.process?.processId && 
            body.process?.natureId && 
            body.process?.stageId && 
            body.channel?.name;
    }
}