import { Router } from 'express';
import { AssetHistoryController } from '../controllers/assetHistoryController';

const router = Router();
const assetHistoryController = new AssetHistoryController();

/**
 * POST /assetHistory/direct
 * Body: { assetId: string }
 * Retorna: Histórico do asset + todos os ancestrais
 */
router.post('/direct', (req, res) => {
  assetHistoryController.getDirectHistory(req, res);
});

/**
 * POST /assetHistory/indirect
 * Body: { assetId: string }
 * Retorna: Histórico completo (asset + ancestrais + descendentes + irmãos)
 */
router.post('/indirect', (req, res) => {
  assetHistoryController.getIndirectHistory(req, res);
});

export default router;