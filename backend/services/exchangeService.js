import ExchangeModel from '../models/exchangeModel.js';

class ExchangeService {
    async createExchange(bookId, fromUser, toUser, pointsUsed, authToken) {
        if (!bookId || !fromUser || !toUser || !pointsUsed) {
            throw new Error('Book ID, from user, to user, and points used are required');
        }

        const exchangeData = {
            book_id: bookId,
            from_user: fromUser,
            to_user: toUser,
            points_used: pointsUsed
        };

        return await ExchangeModel.createExchange(exchangeData, authToken);
    }

    async updateExchange(exchangeId, status, authToken) {
        if (!exchangeId || !status) {
            throw new Error('Exchange ID and status are required');
        }

        const updateData = { status: status };
        return await ExchangeModel.updateExchange(exchangeId, updateData, authToken);
    }

    async getUserExchanges(userId, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await ExchangeModel.getUserExchanges(userId, authToken);
    }
}

export default new ExchangeService();
