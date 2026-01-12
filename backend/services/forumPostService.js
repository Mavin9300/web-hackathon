import ForumPostModel from '../models/forumPostModel.js';

class ForumPostService {
    async createPost(forumId, userId, content, isAnonymous, authToken) {
        if (!forumId || !userId || !content) {
            throw new Error('Forum ID, user ID, and content are required');
        }

        const postData = {
            forum_id: forumId,
            user_id: userId,
            content: content,
            is_anonymous: isAnonymous || false
        };

        return await ForumPostModel.createPost(postData, authToken);
    }

    async getPostsByForum(forumId, authToken) {
        if (!forumId) {
            throw new Error('Forum ID is required');
        }
        return await ForumPostModel.getPostsByForum(forumId, authToken);
    }

    async updatePost(postId, content, authToken) {
        if (!postId || !content) {
            throw new Error('Post ID and content are required');
        }

        const updateData = { content: content };
        return await ForumPostModel.updatePost(postId, updateData, authToken);
    }

    async deletePost(postId, authToken) {
        if (!postId) {
            throw new Error('Post ID is required');
        }
        return await ForumPostModel.deletePost(postId, authToken);
    }
}

export default new ForumPostService();
