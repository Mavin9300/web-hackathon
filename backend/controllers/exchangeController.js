import exchangeService from '../services/exchangeService.js';

class ExchangeController {
    async createExchange(req, res) {
        try {
            const { book_id, from_user, to_user, points_used } = req.body;
            const exchange = await exchangeService.createExchange(book_id, from_user, to_user, points_used, req.authToken);
            res.status(201).json(exchange);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateExchange(req, res) {
        try {
            const exchangeId = req.params.id;
            const { status } = req.body;
            const exchange = await exchangeService.updateExchange(exchangeId, status, req.authToken);
            res.json(exchange);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getUserExchanges(req, res) {
        try {
            const userId = req.params.userId;
            const exchanges = await exchangeService.getUserExchanges(userId, req.authToken);
            res.json(exchanges);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new ExchangeController();
