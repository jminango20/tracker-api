import { Router } from 'express';
import { AssetRegistryController } from '../controllers/assetRegistryController';

const router = Router();
const assetRegistryController = new AssetRegistryController();


/**
 * @route POST /api/assets/info
 * @desc Obter informações do asset
 * @body { channelName: string, assetId: string }
 */
router.post('/info', async (req, res) => {
    await assetRegistryController.getAsset(req, res);
});

export default router;