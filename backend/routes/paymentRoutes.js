import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.post('/', (req, res) => paymentController.createPayment(req, res));
router.post('/create-checkout-session', (req, res) => paymentController.createCheckoutSession(req, res));
router.post('/verify-session', (req, res) => paymentController.verifySession(req, res));

export default router;
