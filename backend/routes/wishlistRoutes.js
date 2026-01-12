import express from 'express';
import wishlistController from '../controllers/wishlistController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/', (req, res) => wishlistController.addToWishlist(req, res));
router.delete('/:userId/:bookId', (req, res) => wishlistController.removeFromWishlist(req, res));
router.get('/:userId', (req, res) => wishlistController.getUserWishlist(req, res));

export default router;
