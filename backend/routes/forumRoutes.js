import express from 'express';
import forumController from '../controllers/forumController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.get('/:bookId', (req, res) => forumController.getForumByBook(req, res));

export default router;
