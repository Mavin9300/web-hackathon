import notificationService from '../services/notificationService.js';

class NotificationController {
    async getUserNotifications(req, res) {
        try {
            const userId = req.params.userId;
            const notifications = await notificationService.getUserNotifications(userId, req.authToken);
            res.json(notifications);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            const notificationId = req.params.id;
            const notification = await notificationService.markAsRead(notificationId, req.authToken);
            res.json(notification);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new NotificationController();
