import { getSupabaseClient } from '../config/supabaseClient.js';

class ForumModel {
    static async getForumByBook(bookId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('forums')
            .select('*')
            .eq('book_id', bookId)
            .maybeSingle();

        if (error) {
            throw error;
        }
        return data;
    }

    static async createForum(forumData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('forums')
            .insert([forumData])
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data;
    }
}

export default ForumModel;
