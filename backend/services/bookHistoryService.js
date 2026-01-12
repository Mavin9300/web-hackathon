import BookHistoryModel from '../models/bookHistoryModel.js';

class BookHistoryService {
    async addHistory(bookId, city, readingDuration, notes, authToken) {
        if (!bookId) {
            throw new Error('Book ID is required');
        }

        const historyData = {
            book_id: bookId,
            city: city,
            reading_duration: readingDuration,
            notes: notes
        };

        return await BookHistoryModel.addHistory(historyData, authToken);
    }

    async getBookHistory(bookId, authToken) {
        if (!bookId) {
            throw new Error('Book ID is required');
        }
        return await BookHistoryModel.getBookHistory(bookId, authToken);
    }
}

export default new BookHistoryService();
