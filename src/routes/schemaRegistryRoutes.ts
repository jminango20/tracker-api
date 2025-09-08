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