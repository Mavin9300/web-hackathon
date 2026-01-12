import messageService from '../services/messageService.js';

class MessageController {
    async createOrGetChat(req, res) {
        try {
            const { user1_id, user2_id } = req.body;
            console.log('Creating chat between:', user1_id, 'and', user2_id);
            const chat = await messageService.createOrGetChat(user1_id, user2_id, req.authToken);
            res.json(chat);
        } catch (error) {
            console.error('Error creating chat:', error.message);
            res.status(400).json({ error: error.message });
        }
    }

    async sendMessage(req, res) {
        try {
            const { chat_id, sender_id, content } = req.body;
            const message = await messageService.sendMessage(chat_id, sender_id, content, req.authToken);
            res.status(201).json(message);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMessagesByChat(req, res) {
        try {
            const chatId = req.params.chatId;
            const messages = await messageService.getMessagesByChat(chatId, req.authToken);
            res.json(messages);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getUserChats(req, res) {
        try {
            const userId = req.params.userId;
            const chats = await messageService.getUserChats(userId, req.authToken);
            res.json(chats);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new MessageController();
