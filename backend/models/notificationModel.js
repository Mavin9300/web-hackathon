import { getSupabaseClient } from '../config/supabaseClient.js';

class NotificationModel {
    static async getUserNotifications(userId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('notifications')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            throw error;
        }
        return data;
    }

    static async markAsRead(notificationId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }
}

export default NotificationModel;
