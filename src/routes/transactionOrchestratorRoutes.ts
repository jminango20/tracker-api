import { Router } from 'express';
import { TransactionOrchestratorController } from '../controllers/transactionOrchestratorController';

const router = Router();
const transactionOrchestratorController = new TransactionOrchestratorController();

/**
 * @route POST /transaction/submit
 * @desc Submeter uma nova transação
 * @body TransactionRequest
 * @header x-private-key: string
 */
router.post('/submit', async (req, res) => {
    await transactionOrchestratorController.submitTransaction(req, res);
});

export default router;