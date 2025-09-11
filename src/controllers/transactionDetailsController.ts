import { Request, Response } from 'express';
import { TransactionDetailsService } from '../services/transactionDetailsService';
import { ResponseHelper } from '../utils/responseHelper';

export class TransactionDetailsController {
    private transactionDetailsService: TransactionDetailsService;

    constructor() {
        this.transactionDetailsService = new TransactionDetailsService();
    }

    // Buscar detalhes completos de uma transação (POST com txHash no body)
    async getTransactionDetails(req: Request, res: Response) {
        try {
            const { txHash } = req.body;

            // Validação do hash da transação
            if (!txHash || typeof txHash !== 'string') {
                return ResponseHelper.sendValidationError(res, 'txHash é obrigatório no body da requisição');
            }

            if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
                return ResponseHelper.sendValidationError(res, 'Hash da transação inválido. Deve ter formato 0x seguido de 64 caracteres hexadecimais');
            }

            console.log(`Requisição para analisar transação: ${txHash}`);

            const result = await this.transactionDetailsService.getTransactionDetails(txHash as `0x${string}`);

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getTransactionDetails:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Buscar APENAS os eventos de uma transação (POST com txHash no body)
    async getTransactionEvents(req: Request, res: Response) {
        try {
            const { txHash } = req.body;

            // Validação do hash da transação
            if (!txHash || typeof txHash !== 'string') {
                return ResponseHelper.sendValidationError(res, 'txHash é obrigatório no body da requisição');
            }

            if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
                return ResponseHelper.sendValidationError(res, 'Hash da transação inválido. Deve ter formato 0x seguido de 64 caracteres hexadecimais');
            }

            console.log(`Requisição para buscar eventos da transação: ${txHash}`);

            const result = await this.transactionDetailsService.getTransactionEvents(txHash as `0x${string}`);

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getTransactionEvents:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}