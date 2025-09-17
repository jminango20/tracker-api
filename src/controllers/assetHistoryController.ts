import { Request, Response } from 'express';
import { AssetHistoryService } from '../services/assetHistoryService';
import { ResponseHelper } from '../utils/responseHelper';
import { 
    AssetHistoryQuery, 
    HistoryQueryType,
    HISTORY_QUERY_LIMITS
} from '../types/assetHistoryTypes';

export class AssetHistoryController {
    private assetHistoryService: AssetHistoryService;

    constructor() {
        this.assetHistoryService = new AssetHistoryService();
    }

    /**
     * Obter histórico completo de um asset
     * POST /api/assets/history
     */
    async getAssetHistory(req: Request, res: Response) {
        try {
            const { assetId, type, fromDate, toDate, operations, maxDepth, limit, offset } = req.body;

            // Validações básicas
            if (!assetId || typeof assetId !== 'string') {
                return ResponseHelper.sendValidationError(res, 'assetId é obrigatório e deve ser uma string');
            }

            if (!type || !Object.values(HistoryQueryType).includes(type)) {
                return ResponseHelper.sendValidationError(res, 'type é obrigatório e deve ser DIRECT ou INDIRECT');
            }

            console.log(`Requisição de histórico: ${assetId} (${type})`);

            // Construir query
            const query: AssetHistoryQuery = {
                assetId: assetId.trim(),
                type: type as HistoryQueryType,
                fromDate: fromDate ? new Date(fromDate) : undefined,
                toDate: toDate ? new Date(toDate) : undefined,
                operations: operations || undefined,
                includeInactive: false,
                maxDepth: maxDepth || 5,
                limit: Math.min(limit || HISTORY_QUERY_LIMITS.DEFAULT_LIMIT, HISTORY_QUERY_LIMITS.MAX_RESULTS),
                offset: offset || 0
            };

            const result = await this.assetHistoryService.getAssetHistory(query);

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getAssetHistory:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    /**
     * Verificar se um asset existe
     * GET /api/assets/:assetId/exists
     */
    async checkAssetExists(req: Request, res: Response) {
        try {
            const { assetId } = req.params;

            if (!assetId || typeof assetId !== 'string') {
                return ResponseHelper.sendValidationError(res, 'assetId é obrigatório');
            }

            console.log(`✓ Verificando existência: ${assetId}`);

            const exists = await this.assetHistoryService.assetExists(assetId.trim());

            return ResponseHelper.sendSuccess(res, {
                assetId: assetId.trim(),
                exists
            }, exists ? 'Asset encontrado' : 'Asset não encontrado');

        } catch (error) {
            console.error('Erro no controller checkAssetExists:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}