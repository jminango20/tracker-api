import { Router } from 'express';
import { HealthCheckController } from '../controllers/healthCheckController';

const router = Router();
const healthController = new HealthCheckController();

router.get('/health', async (req, res) => {
    await healthController.healthCheck(req, res);
});

router.get('/blockchain', async (req, res) => {
    await healthController.blockchainStatus(req, res);
});

export default router;