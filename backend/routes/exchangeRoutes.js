import express from 'express';
import exchangeController from '../controllers/exchangeController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/', (req, res) => exchangeController.createExchange(req, res));
router.put('/:id', (req, res) => exchangeController.updateExchange(req, res));
router.get('/:userId', (req, res) => exchangeController.getUserExchanges(req, res));

export default router;
