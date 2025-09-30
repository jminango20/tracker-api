import { Router } from 'express';
import { AssetRegistryController } from '../controllers/assetRegistryController';

const router = Router();
const assetRegistryController = new AssetRegistryController();


/**
 * @route POST /api/assets/basic
 * @desc Obter informações básicas do asset
 * @body { channelName: string, assetId: string }
 * @returns Dados essenciais: ID, owner, amount, location, status, timestamps
 */
router.post('/basic', async (req, res) => {
    await assetRegistryController.getAsset(req, res);
});

/**
 * @route POST /api/assets/details
 * @desc Obter informações completas do asset
 * @body { channelName: string, assetId: string }
 * @returns Dados completos: básicos, dataHash, originOwner, relacionamentos
 */
router.post('/details', async (req, res) => {
    await assetRegistryController.getAssetDetails(req, res);
});

export default router;