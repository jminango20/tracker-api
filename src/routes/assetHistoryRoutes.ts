import { Router } from 'express';
import { AssetHistoryController } from '../controllers/assetHistoryController';

const router = Router();
const assetHistoryController = new AssetHistoryController();

/**
 * POST /api/assets/history
 * Obter histórico completo de um asset
 */
router.post('/history', assetHistoryController.getAssetHistory.bind(assetHistoryController));

/**
 * GET /api/assets/:assetId/exists
 * Verificar se um asset existe
 */
router.get('/:assetId/exists', assetHistoryController.checkAssetExists.bind(assetHistoryController));

export default router;