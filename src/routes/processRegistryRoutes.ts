import { Router } from 'express';
import { ProcessRegistryController } from '../controllers/processRegistryController';

const router = Router();
const processRegistryController = new ProcessRegistryController();

/**
 * @route POST /api/process/create
 * @desc Criar um novo processo
 * @body { 
 *   processId: string, 
 *   natureId: string, 
 *   stageId: string, 
 *   schemas: SchemaReference[], 
 *   action: string, 
 *   description: string, 
 *   channelName: string 
 * }
 * @header x-private-key: string
 */
router.post('/create', async (req, res) => {
    await processRegistryController.createProcess(req, res);
});

/**
 * @route POST /api/process/status
 * @desc Alterar status do processo
 * @body { channelName: string, processId: string, natureId: string, stageId: string, status: string }
 * @header x-private-key: string
 */
router.post('/status', async (req, res) => {
    await processRegistryController.setProcessStatus(req, res);
});

/**
 * @route POST /api/process/inactivate
 * @desc Inativar um processo
 * @body { channelName: string, processId: string, natureId: string, stageId: string }
 * @header x-private-key: string
 */
router.post('/inactivate', async (req, res) => {
    await processRegistryController.inactivateProcess(req, res);
});

/**
 * @route POST /api/process/get
 * @desc Buscar um processo específico
 * @body { channelName: string, processId: string, natureId: string, stageId: string }
 */
router.post('/get', async (req, res) => {
    await processRegistryController.getProcess(req, res);
});

/**
 * @route POST /api/process/validate
 * @desc Validar se processo é válido para submissão
 * @body { channelName: string, processId: string, natureId: string, stageId: string }
 */
router.post('/validate', async (req, res) => {
    await processRegistryController.validateProcessForSubmission(req, res);
});

export default router;