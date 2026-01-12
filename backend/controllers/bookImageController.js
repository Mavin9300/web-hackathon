import bookImageService from '../services/bookImageService.js';

class BookImageController {
    async addImage(req, res) {
        try {
            const { book_id, image_url } = req.body;
            const image = await bookImageService.addImage(book_id, image_url, req.authToken);
            res.status(201).json(image);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteImage(req, res) {
        try {
            const imageId = req.params.id;
            await bookImageService.deleteImage(imageId, req.authToken);
            res.json({ message: 'Image deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new BookImageController();
