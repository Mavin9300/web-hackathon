import BookImageModel from '../models/bookImageModel.js';

class BookImageService {
    async addImage(bookId, imageUrl, authToken) {
        if (!bookId || !imageUrl) {
            throw new Error('Book ID and image URL are required');
        }

        const imageData = {
            book_id: bookId,
            image_url: imageUrl
        };

        return await BookImageModel.addImage(imageData, authToken);
    }

    async deleteImage(imageId, authToken) {
        if (!imageId) {
            throw new Error('Image ID is required');
        }
        return await BookImageModel.deleteImage(imageId, authToken);
    }
}

export default new BookImageService();
