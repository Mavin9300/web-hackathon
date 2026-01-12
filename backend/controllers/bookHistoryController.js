import bookHistoryService from '../services/bookHistoryService.js';

class BookHistoryController {
    async addHistory(req, res) {
        try {
            const { book_id, city, reading_duration, notes } = req.body;
            const history = await bookHistoryService.addHistory(book_id, city, reading_duration, notes, req.authToken);
            res.status(201).json(history);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getBookHistory(req, res) {
        try {
            const bookId = req.params.bookId;
            const history = await bookHistoryService.getBookHistory(bookId, req.authToken);
            res.json({ history });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new BookHistoryController();
