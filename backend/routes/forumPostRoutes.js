import express from 'express';
import forumPostController from '../controllers/forumPostController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/', (req, res) => forumPostController.createPost(req, res));
router.get('/:forumId', (req, res) => forumPostController.getPostsByForum(req, res));
router.put('/:id', (req, res) => forumPostController.updatePost(req, res));
router.delete('/:id', (req, res) => forumPostController.deletePost(req, res));

export default router;
