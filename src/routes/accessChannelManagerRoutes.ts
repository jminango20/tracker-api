import { Router } from 'express';
import { AccessChannelManagerController } from '../controllers/accessChannelManagerController';

const router = Router();
const accessChannelController = new AccessChannelManagerController();

/**
 * @route POST /api/access-channel/create
 * @desc Criar um novo canal
 * @body { channelName: string }
 * @header x-private-key: string
*/
router.post('/create', async (req, res) => {
    await accessChannelController.createChannel(req, res);
});

/**
 * @route POST /api/access-channel/activate
 * @desc Ativar um canal
 * @body { channelName: string }
 * @header x-private-key: string
 */
router.post('/activate', async (req, res) => {
    await accessChannelController.activateChannel(req, res);
});

/**
 * @route POST /api/access-channel/desactivate
 * @desc Desativar um canal
 * @body { channelName: string }
 * @header x-private-key: string
 */
router.post('/desactivate', async (req, res) => {
    await accessChannelController.desactivateChannel(req, res);
});

/**
 * @route POST /api/access-channel/info
 * @desc Buscar informações de um canal
 * @body { channelName: string }
 */
router.post('/info', async (req, res) => {
    await accessChannelController.getChannelInfo(req, res);
});

export default router;