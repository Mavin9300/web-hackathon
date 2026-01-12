import bookService from '../services/bookService.js';

class BookController {
    async getAllBooks(req, res) {
        try {
            const { search, nearby, radius, my_books } = req.query;
            const filters = { search, nearby, radius };

            if (my_books === 'true') {
                const client = (await import('../config/supabaseClient.js')).getSupabaseClient(req.authToken);
                const { data: { user } } = await client.auth.getUser();
                if (user) {
                    filters.owner_id = user.id;
                }
            }

            const books = await bookService.getAllBooks(filters, req.authToken);
            res.json(books);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getBookById(req, res) {
        try {
            const bookId = req.params.id;
            const book = await bookService.getBookById(bookId, req.authToken);
            res.json(book);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async createBook(req, res) {
        try {
            const client = (await import('../config/supabaseClient.js')).getSupabaseClient(req.authToken);
            const { data: { user }, error } = await client.auth.getUser();


            if (error || !user) {
                console.error('Auth User Error:', error);
                return res.status(401).json({ error: 'Unauthorized' });
            }

            console.log('[BookController] Authenticated User ID:', user.id);
            // Ensure owner_id is set to the authenticated user's ID
            const bookData = { ...req.body, owner_id: user.id };
            console.log('[BookController] Creating book with Owner ID:', bookData.owner_id);

            const newBook = await bookService.createBook(bookData, req.authToken);
            res.status(201).json(newBook);
        } catch (error) {
            console.error('Create Book Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async updateBook(req, res) {
        try {
            const bookId = req.params.id;
            const updatedBook = await bookService.updateBook(bookId, req.body, req.authToken);
            res.json(updatedBook);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteBook(req, res) {
        try {
            const bookId = req.params.id;
            await bookService.deleteBook(bookId, req.authToken);
            res.json({ message: 'Book deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new BookController();
