import { getSupabaseClient } from '../config/supabaseClient.js';

class ForumPostModel {
    static async createPost(postData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('forum_posts')
            .insert([postData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async getPostsByForum(forumId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('forum_posts')
            .select(`
                *,
                profile:profiles!forum_posts_user_id_fkey (
                    username,
                    image_url
                )
            `)
            .eq('forum_id', forumId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }
        return data;
    }

    static async updatePost(postId, updateData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('forum_posts')
            .update(updateData)
            .eq('id', postId)
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async deletePost(postId, authToken) {
        const client = getSupabaseClient(authToken);
        const { error } = await client
            .from('forum_posts')
            .delete()
            .eq('id', postId);

        if (error) {
            throw error;
        }
        return { success: true };
    }
}

export default ForumPostModel;
