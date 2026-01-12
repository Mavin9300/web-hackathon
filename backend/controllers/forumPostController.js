import forumPostService from '../services/forumPostService.js';

class ForumPostController {
    async createPost(req, res) {
        try {
            const { forum_id, user_id, content, is_anonymous } = req.body;
            const post = await forumPostService.createPost(forum_id, user_id, content, is_anonymous, req.authToken);
            res.status(201).json(post);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getPostsByForum(req, res) {
        try {
            const forumId = req.params.forumId;
            const posts = await forumPostService.getPostsByForum(forumId, req.authToken);
            res.json(posts);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updatePost(req, res) {
        try {
            const postId = req.params.id;
            const { content } = req.body;
            const post = await forumPostService.updatePost(postId, content, req.authToken);
            res.json(post);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deletePost(req, res) {
        try {
            const postId = req.params.id;
            await forumPostService.deletePost(postId, req.authToken);
            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new ForumPostController();
