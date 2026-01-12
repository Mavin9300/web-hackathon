import { getSupabaseClient } from '../config/supabaseClient.js';

class BookModel {
    static async getAllBooks(filters = {}, authToken) {
        const client = getSupabaseClient(authToken);
        
        let query = client
            .from('books')
            .select('*, book_images(image_url), owner:profiles!books_owner_id_fkey(username)');

        if (filters.search) {
            const term = `%${filters.search}%`;
            query = query.or(`title.ilike.${term},author.ilike.${term}`);
        }

        if (filters.owner_id) {
            query = query.eq('owner_id', filters.owner_id);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Logic for "nearby" is skipped as lat/lon columns are missing in schema, 
        // but we ensure typical list logic works.
        
        return data;
    }

    static async getBookById(bookId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('books')
            .select('*, book_images(image_url), owner:profiles!books_owner_id_fkey(username)')
            .eq('id', bookId)
            .single();

        if (error) {
            throw error;
        }
        return data;
    }

    static async createBook(bookData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('books')
            .insert([bookData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async updateBook(bookId, bookData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('books')
            .update(bookData)
            .eq('id', bookId)
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async deleteBook(bookId, authToken) {
        const client = getSupabaseClient(authToken);
        const { error } = await client
            .from('books')
            .delete()
            .eq('id', bookId);

        if (error) {
            throw error;
        }
        return { success: true };
    }
}

export default BookModel;
