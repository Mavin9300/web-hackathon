import express from 'express';
import messageController from '../controllers/messageController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/chat/create', (req, res) => messageController.createOrGetChat(req, res));
router.post('/', (req, res) => messageController.sendMessage(req, res));
router.get('/chat/:chatId', (req, res) => messageController.getMessagesByChat(req, res));
router.get('/user/:userId', (req, res) => messageController.getUserChats(req, res));

export default router;
