import NotificationModel from '../models/notificationModel.js';

class NotificationService {
    async getUserNotifications(userId, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await NotificationModel.getUserNotifications(userId, authToken);
    }

    async markAsRead(notificationId, authToken) {
        if (!notificationId) {
            throw new Error('Notification ID is required');
        }
        return await NotificationModel.markAsRead(notificationId, authToken);
    }
}

export default new NotificationService();
