import express from 'express';
import bookHistoryController from '../controllers/bookHistoryController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/', (req, res) => bookHistoryController.addHistory(req, res));
router.get('/:bookId', (req, res) => bookHistoryController.getBookHistory(req, res));

export default router;
