import express from 'express';
import bookImageController from '../controllers/bookImageController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/', (req, res) => bookImageController.addImage(req, res));
router.delete('/:id', (req, res) => bookImageController.deleteImage(req, res));

export default router;
