import { Router } from 'express';
import { SchemaRegistryController } from '../controllers/schemaRegistryController';

const router = Router();
const schemaRegistryController = new SchemaRegistryController();

/**
 * @route POST /api/schemas/create
 * @desc Criar um novo schema
 * @body { id: string, name: string, dataHash: string, channelName: string, description: string }
 * @header x-private-key: string
 */
router.post('/create', async (req, res) => {
    await schemaRegistryController.createSchema(req, res);
});

/**
 * @route POST /api/schemas/update
 * @desc Atualizar schema criando nova versão
 * @body { id: string, newDataHash: string, channelName: string, description: string }
 * @header x-private-key: string
 */
router.post('/update', async (req, res) => {
    await schemaRegistryController.updateSchema(req, res);
});

/**
 * @route POST /api/schemas/deprecate
 * @desc Depreciar a versão ativa de um schema
 * @body { schemaId: string, channelName: string }
 * @header x-private-key: string
 */
router.post('/deprecate', async (req, res) => {
    await schemaRegistryController.deprecateSchema(req, res);
});

/**
 * @route POST /api/schemas/inactivate
 * @desc Inativar uma versão específica de um schema
 * @body { schemaId: string, version: number, channelName: string }
 * @header x-private-key: string
 */
router.post('/inactivate', async (req, res) => {
    await schemaRegistryController.inactivateSchema(req, res);
});

/**
 * @route POST /api/schemas/status
 * @desc Atualizar status do schema
 * @body { id: string, version: number, channelName: string, status: string }
 * @header x-private-key: string
 */
router.post('/status', async (req, res) => {
    await schemaRegistryController.setSchemaStatus(req, res);
});

/**
 * @route POST /api/schemas/version
 * @desc Obter informações do schema por versão
 * @body { channelName: string, schemaId: string, version: number }
 */
router.post('/version', async (req, res) => {
    await schemaRegistryController.getSchemaByVersion(req, res);
});

/**
 * @route POST /api/schemas/info
 * @desc Obter informações do schema
 * @body { channelName: string, schemaId: string }
 */
router.post('/info', async (req, res) => {
    await schemaRegistryController.getSchemaInfo(req, res);
});

/**
 * @route POST /api/schemas/active
 * @desc Obter schema ativo completo
 * @body { channelName: string, schemaId: string }
 */
router.post('/active', async (req, res) => {
    await schemaRegistryController.getActiveSchema(req, res);
});

export default router;