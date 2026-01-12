import wishlistService from '../services/wishlistService.js';

class WishlistController {
    async addToWishlist(req, res) {
        try {
            const { user_id, book_id } = req.body;
            const wishlist = await wishlistService.addToWishlist(user_id, book_id, req.authToken);
            res.status(201).json(wishlist);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeFromWishlist(req, res) {
        try {
            const { userId, bookId } = req.params;
            await wishlistService.removeFromWishlist(userId, bookId, req.authToken);
            res.json({ message: 'Removed from wishlist successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getUserWishlist(req, res) {
        try {
            const userId = req.params.userId;
            const wishlist = await wishlistService.getUserWishlist(userId, req.authToken);
            res.json(wishlist);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new WishlistController();
