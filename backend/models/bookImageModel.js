import { getSupabaseClient } from '../config/supabaseClient.js';

class BookImageModel {
    static async addImage(imageData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('book_images')
            .insert([imageData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async deleteImage(imageId, authToken) {
        const client = getSupabaseClient(authToken);
        const { error } = await client
            .from('book_images')
            .delete()
            .eq('id', imageId);

        if (error) {
            throw error;
        }
        return { success: true };
    }
}

export default BookImageModel;
