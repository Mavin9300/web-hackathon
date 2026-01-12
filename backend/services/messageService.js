import MessageModel from '../models/messageModel.js';

class MessageService {
    async createOrGetChat(user1Id, user2Id, authToken, bookId = null) {
        if (!user1Id || !user2Id) {
            throw new Error('Both user IDs are required');
        }
        if (user1Id === user2Id) {
            throw new Error('Cannot create chat with yourself');
        }
        return await MessageModel.createOrGetChat(user1Id, user2Id, authToken, bookId);
    }

    async sendMessage(chatId, senderId, content, authToken) {
        if (!chatId || !senderId || !content) {
            throw new Error('Chat ID, sender ID, and content are required');
        }

        const messageData = {
            chat_id: chatId,
            sender_id: senderId,
            content: content
        };

        return await MessageModel.sendMessage(messageData, authToken);
    }

    async getMessagesByChat(chatId, authToken) {
        if (!chatId) {
            throw new Error('Chat ID is required');
        }
        return await MessageModel.getMessagesByChat(chatId, authToken);
    }

    async getUserChats(userId, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await MessageModel.getUserChats(userId, authToken);
    }
}

export default new MessageService();
