import { getSupabaseClient } from '../config/supabaseClient.js';

class WishlistModel {
    static async addToWishlist(wishlistData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('wishlists')
            .insert([wishlistData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async removeFromWishlist(userId, bookId, authToken) {
        const client = getSupabaseClient(authToken);
        const { error } = await client
            .from('wishlists')
            .delete()
            .eq('user_id', userId)
            .eq('book_id', bookId);

        if (error) {
            throw error;
        }
        return { success: true };
    }

    static async getUserWishlist(userId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('wishlists')
            .select('*, book:books(*, book_images(*))')
            .eq('user_id', userId);

        if (error) {
            throw error;
        }
        return data;
    }
}

export default WishlistModel;
