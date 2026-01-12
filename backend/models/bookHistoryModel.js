import { getSupabaseClient } from '../config/supabaseClient.js';

class BookHistoryModel {
    static async addHistory(historyData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('book_history')
            .insert([historyData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async getBookHistory(bookId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('book_history')
            .select('*')
            .eq('book_id', bookId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }
        return data;
    }
}

export default BookHistoryModel;
