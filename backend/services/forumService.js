import ForumModel from '../models/forumModel.js';

class ForumService {
    async getForumByBook(bookId, authToken) {
        if (!bookId) {
            throw new Error('Book ID is required');
        }
        
        // Try to get existing forum
        let forum = await ForumModel.getForumByBook(bookId, authToken);
        
        // If forum doesn't exist, create it
        if (!forum) {
            forum = await ForumModel.createForum({ book_id: bookId }, authToken);
        }
        
        return forum;
    }
}

export default new ForumService();
