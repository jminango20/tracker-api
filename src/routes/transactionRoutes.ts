import { Router } from 'express';
import { TransactionDetailsController } from '../controllers/transactionDetailsController';

const router = Router();
const transactionController = new TransactionDetailsController();

// Rotas para análise de transações (POST com txHash no body)
router.post('/details', async (req, res) => {
    await transactionController.getTransactionDetails(req, res);
});

router.post('/events', async (req, res) => {
    await transactionController.getTransactionEvents(req, res);
});

export default router;