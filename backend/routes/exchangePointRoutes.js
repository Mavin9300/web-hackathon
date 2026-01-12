import express from 'express';
import exchangePointController from '../controllers/exchangePointController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/', (req, res) => exchangePointController.createPoint(req, res));
router.get('/', (req, res) => exchangePointController.getAllPoints(req, res));
router.put('/:id', (req, res) => exchangePointController.updatePoint(req, res));
router.delete('/:id', (req, res) => exchangePointController.deletePoint(req, res));

export default router;
