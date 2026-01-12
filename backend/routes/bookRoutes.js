import express from 'express';
import bookController from '../controllers/bookController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.get('/', (req, res) => bookController.getAllBooks(req, res));
router.get('/:id', (req, res) => bookController.getBookById(req, res));
router.post('/', (req, res) => bookController.createBook(req, res));
router.put('/:id', (req, res) => bookController.updateBook(req, res));
router.delete('/:id', (req, res) => bookController.deleteBook(req, res));

export default router;
