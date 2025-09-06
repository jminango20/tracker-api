import { Router } from 'express';
import { AccessChannelManagerController } from '../controllers/accessChannelManagerController';

const router = Router();
const accessChannelController = new AccessChannelManagerController();

/**
 * @route POST /api/accessChannel/create
 * @desc Criar um novo canal
 * @body { channelName: string }
 * @header x-private-key: string
*/
router.post('/create', async (req, res) => {
    await accessChannelController.createChannel(req, res);
});

/**
 * @route POST /api/accessChannel/activate
 * @desc Ativar um canal
 * @body { channelName: string }
 * @header x-private-key: string
 */
router.post('/activate', async (req, res) => {
    await accessChannelController.activateChannel(req, res);
});

/**
 * @route POST /api/accessChannel/desactivate
 * @desc Desativar um canal
 * @body { channelName: string }
 * @header x-private-key: string
 */
router.post('/desactivate', async (req, res) => {
    await accessChannelController.desactivateChannel(req, res);
});

/**
 * @route POST /api/accessChannel/info
 * @desc Buscar informações de um canal
 * @body { channelName: string }
 */
router.post('/info', async (req, res) => {
    await accessChannelController.getChannelInfo(req, res);
});

/**
 * @route POST /api/accessChannel/addMember
 * @desc Adicionar membro ao canal
 * @body { channelName: string, memberAddress: string }
 * @header x-private-key: string
 */
router.post('/addMember', async (req, res) => {
    await accessChannelController.addChannelMember(req, res);
});

/**
 * @route POST /api/accessChannel/removeMember
 * @desc Remover membro do canal
 * @body { channelName: string, memberAddress: string }
 * @header x-private-key: string
 */
router.post('/removeMember', async (req, res) => {
    await accessChannelController.removeChannelMember(req, res);
});

/**
 * @route POST /api/accessChannel/addMembers
 * @desc Adicionar múltiplos membros ao canal
 * @body { channelName: string, memberAddresses: string[] }
 * @header x-private-key: string
 */
router.post('/addMembers', async (req, res) => {
    await accessChannelController.addChannelMembers(req, res);
});

/**
 * @route POST /api/accessChannel/remove-members
 * @desc Remover múltiplos membros do canal
 * @body { channelName: string, memberAddresses: string[] }
 * @header x-private-key: string
 */
router.post('/removeMembers', async (req, res) => {
    await accessChannelController.removeChannelMembers(req, res);
});

/**
 * @route POST /api/accessChannel/isChannelMember
 * @desc Verificar se é membro do canal
 * @body { channelName: string, memberAddress: string }
 */
router.post('/isChannelMember', async (req, res) => {
    await accessChannelController.isChannelMember(req, res);
});

/**
 * @route GET /api/accessChannel/count
 * @desc Obter total de canais
 */
router.get('/count', async (req, res) => {
    await accessChannelController.getChannelCount(req, res);
});

/**
 * @route GET /api/accessChannel/channels
 * @desc Obter canais paginados
 * @query page: number (default: 1)
 * @query pageSize: number (default: 10, max: 100)
 */
router.get('/channels', async (req, res) => {
    await accessChannelController.getAllChannelsPaginated(req, res);
});

/**
 * @route POST /api/accessChannel/memberCount
 * @desc Obter total de membros do canal
 * @body { channelName: string }
 */
router.post('/memberCount', async (req, res) => {
    await accessChannelController.getChannelMemberCount(req, res);
});

/**
 * @route POST /api/accessChannel/members
 * @desc Obter membros paginados
 * @body { channelName: string }
 * @query page: number (default: 1)
 * @query pageSize: number (default: 10, max: 100)
 */
router.post('/members', async (req, res) => {
    await accessChannelController.getChannelMembersPaginated(req, res);
});

/**
 * @route POST /api/accessChannel/checkMembers
 * @desc Verificar múltiplos membros
 * @body { channelName: string, memberAddresses: string[] }
 */
router.post('/checkMembers', async (req, res) => {
    await accessChannelController.areChannelMembers(req, res);
});


export default router;