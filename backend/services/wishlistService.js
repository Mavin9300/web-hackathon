import WishlistModel from '../models/wishlistModel.js';

class WishlistService {
    async addToWishlist(userId, bookId, authToken) {
        if (!userId || !bookId) {
            throw new Error('User ID and Book ID are required');
        }

        const wishlistData = {
            user_id: userId,
            book_id: bookId
        };

        return await WishlistModel.addToWishlist(wishlistData, authToken);
    }

    async removeFromWishlist(userId, bookId, authToken) {
        if (!userId || !bookId) {
            throw new Error('User ID and Book ID are required');
        }
        return await WishlistModel.removeFromWishlist(userId, bookId, authToken);
    }

    async getUserWishlist(userId, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await WishlistModel.getUserWishlist(userId, authToken);
    }
}

export default new WishlistService();
