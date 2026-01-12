import forumService from '../services/forumService.js';

class ForumController {
    async getForumByBook(req, res) {
        try {
            const bookId = req.params.bookId;
            const forum = await forumService.getForumByBook(bookId, req.authToken);
            res.json(forum);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new ForumController();
