import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.get('/:userId', (req, res) => notificationController.getUserNotifications(req, res));
router.put('/:id', (req, res) => notificationController.markAsRead(req, res));

export default router;
