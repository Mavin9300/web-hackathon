import express from 'express';
import { createRequest, updateRequestStatus, getRequests } from '../controllers/requestController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/create', createRequest);
router.put('/:id/status', updateRequestStatus);
router.get('/', getRequests);

export default router;
