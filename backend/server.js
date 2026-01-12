import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import tokenRoutes from './token.js';
import profileRoutes from './routes/profileRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import bookImageRoutes from './routes/bookImageRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import bookHistoryRoutes from './routes/bookHistoryRoutes.js';
import exchangeRoutes from './routes/exchangeRoutes.js';
import exchangePointRoutes from './routes/exchangePointRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import forumPostRoutes from './routes/forumPostRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.endsWith('.vercel.app') || origin.includes('localhost')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes); // Prioritize our new auth routes
app.use('/api/token', tokenRoutes); // Kept for legacy/other uses if any (was mounted at /api/auth)
app.use('/api/profiles', profileRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/book-images', bookImageRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/book-history', bookHistoryRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/exchange-points', exchangePointRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/forum-posts', forumPostRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
