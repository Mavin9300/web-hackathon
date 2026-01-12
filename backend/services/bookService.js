import BookModel from '../models/bookModel.js';
import ProfileModel from '../models/profileModel.js';
import QRCode from 'qrcode';
import aiService from './aiService.js';

class BookService {
    async getAllBooks(filters = {}, authToken) {
        // Resolve logic for "nearby" if needed
        // If nearby=true, we need the user's current location from their profile.
        
        let queryFilters = { ...filters };
        
        if (filters.nearby === 'true' || filters.nearby === true) {
             // Fetch user profile to get lat/lon
             const client = (await import('../config/supabaseClient.js')).getSupabaseClient(authToken);
             const { data: { user } } = await client.auth.getUser();
             
             if (user) {
                 const profile = await ProfileModel.getProfile(user.id, authToken);
                 if (profile && profile.latitude && profile.longitude) {
                     queryFilters.lat = profile.latitude;
                     queryFilters.lon = profile.longitude;
                     queryFilters.radius = filters.radius || 20; // Default 20km
                 } else {
                     // If user has no location, we can't do nearby. 
                     // Return empty? Or ignore nearby?
                     // Let's return empty to indicate no results nearby (implied).
                     return [];
                 }
             }
        }

        return await BookModel.getAllBooks(queryFilters, authToken);
    }

    async getBookById(bookId, authToken) {
        if (!bookId) {
            throw new Error('Book ID is required');
        }
        return await BookModel.getBookById(bookId, authToken);
    }

    async createBook(bookData, authToken) {
        if (!bookData.title || !bookData.author || !bookData.condition || !bookData.owner_id) {
            throw new Error('Title, author, condition and owner_id are required');
        }

        // 1. Check Profile Location
        const profile = await ProfileModel.getProfile(bookData.owner_id, authToken);
        if (!profile || !profile.location) {
            throw new Error('Please add your location in the profile section first.');
        }

        // 2. Generate QR Code (Text)
        // Format: Title | Author | Description | OwnerID | Timestamp
        const qrString = JSON.stringify({
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            owner: bookData.owner_id,
            ts: Date.now()
        });
        
        // We will store the base64 data URL if we want to display it, OR just the text string if that's what is requested.
        // User said: "save in text form in the book table". 
        // "install necessary packages for genereting the QR code... and save in text form" -> 
        // Usually saving the text payload is enough, but if they want the QR image string (base64) it's different.
        // "generating the QR code of the fields ... and save in text form"
        // I will assume they want the Generated QR CODE IMAGE as a Base64 string OR the invalid payload.
        // Given "save in text form", and it's a "qr_code" column (unique), it implies the CONTENT of the QR code or the visual representation.
        // "qr_code text unique not null"
        // I will generate the QR Code Image as Data URL string.
        
        let qrCodeDataUrl;
        try {
            qrCodeDataUrl = await QRCode.toDataURL(qrString);
        } catch (err) {
            console.error('QR Gen Error', err);
            throw new Error('Failed to generate QR code');
        }

        // 3. Calculate book points using AI (spam detection + value assessment)
        let bookPoints = 10; // Default
        try {
            bookPoints = await aiService.calculateBookPoints({
                title: bookData.title,
                author: bookData.author,
                description: bookData.description || '',
                condition: bookData.condition
            });
            console.log(`[BookService] AI calculated ${bookPoints} points for "${bookData.title}"`);
        } catch (error) {
            console.error('[BookService] AI point calculation failed, using default 10 points:', error);
            bookPoints = 10;
        }

        const newBook = {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            condition: bookData.condition,
            owner_id: bookData.owner_id,
            location: profile.location, // Set location from profile
            latitude: profile.latitude,
            longitude: profile.longitude,
            qr_code: qrCodeDataUrl, // Saving the generated QR image data string
            points: bookPoints, // AI-calculated points
            is_available: true
        };

        let createdBook;
        try {
            createdBook = await BookModel.createBook(newBook, authToken);
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                 throw new Error('You already have a book with this title and author.');
            }
            throw error;
        }

        // 4. Handle Book Image
        if (bookData.image_url && createdBook) {
             const { error: imageError } = await (await import('../config/supabaseClient.js')).getSupabaseClient(authToken)
                .from('book_images')
                .insert([{
                    book_id: createdBook.id,
                    image_url: bookData.image_url
                }]);
            
            if (imageError) {
                console.error('Error saving book image reference:', imageError);
            }
             createdBook.image_url = bookData.image_url;
        }

        // 5. Update User Profile Points (Add Book Points to User)
        try {
             const currentProfile = await ProfileModel.getProfile(bookData.owner_id, authToken);
             
             // Ensure we have numbers
             const currentPoints = (currentProfile && typeof currentProfile.points === 'number') ? currentProfile.points : 0;
             const bookPoints = (typeof newBook.points === 'number' && !isNaN(newBook.points)) ? newBook.points : 10;
             
             const newTotal = currentPoints + bookPoints;
             
             console.log(`[BookService] Points Logic: Current(${currentPoints}) + Book(${bookPoints}) = Total(${newTotal})`);
             
             if (isNaN(newTotal)) {
                 console.error('[BookService] Calculated New Total is NaN! Aborting update.');
             } else {
                 await ProfileModel.updatePoints(bookData.owner_id, newTotal, authToken);
             }
             
        } catch(err) {
            console.error('[BookService] Failed to update user profile points:', err);
            // Non-blocking, continue
        }

        return createdBook;
    }

    async updateBook(bookId, bookData, authToken) {
        if (!bookId) {
            throw new Error('Book ID is required');
        }

        const updateData = {};
        if (bookData.title) updateData.title = bookData.title;
        if (bookData.author) updateData.author = bookData.author;
        if (bookData.description) updateData.description = bookData.description;
        if (bookData.condition) updateData.condition = bookData.condition;
        if (bookData.location) updateData.location = bookData.location;
        if (bookData.is_available !== undefined) updateData.is_available = bookData.is_available;

        // Check if we need to regenerate QR Code (if visible fields changed)
        if (bookData.title || bookData.author || bookData.description || bookData.condition) {
            // Fetch current book to merge data if strictly needed, or just use what we have if we assume full update?
            // Actually, we need the *full* set of fields for the QR to be complete if we are partial updating.
            // Let's fetch the current book first.
            const currentBook = await BookModel.getBookById(bookId, authToken);
            if (currentBook) {
                 const qrPayload = {
                    id: bookId,
                    title: bookData.title || currentBook.title,
                    author: bookData.author || currentBook.author,
                    description: bookData.description || currentBook.description,
                    owner_id: currentBook.owner_id,
                    timestamp: currentBook.created_at
                };
                const qrString = JSON.stringify(qrPayload);
                try {
                    const qrCodeDataUrl = await QRCode.toDataURL(qrString);
                    updateData.qr_code = qrCodeDataUrl;
                } catch (e) {
                    console.error("Failed to regenerate QR code during update", e);
                }
            }
        }

        try {
            const updatedBook = await BookModel.updateBook(bookId, updateData, authToken);

            if (bookData.image_url) {
                 const client = (await import('../config/supabaseClient.js')).getSupabaseClient(authToken);
                 try {
                    // Delete old images
                    await client.from('book_images').delete().eq('book_id', bookId);
                    // Insert new image
                    await client.from('book_images').insert([{ book_id: bookId, image_url: bookData.image_url }]);
                    
                    // Attach for return
                    if(updatedBook) updatedBook.book_images = [{ image_url: bookData.image_url }]; 
                 } catch (e) {
                     console.error("Error updating book image", e);
                 }
            }
            return updatedBook;
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('You already have a book with this title and author.');
            }
            throw error;
        }
    }

    async deleteBook(bookId, authToken) {
        if (!bookId) {
            throw new Error('Book ID is required');
        }

        // 0. Fetch Book to get Points and Owner for deduction
        try {
            const bookToDelete = await BookModel.getBookById(bookId, authToken);
            if (bookToDelete && bookToDelete.owner_id && bookToDelete.points > 0) {
                 const profile = await ProfileModel.getProfile(bookToDelete.owner_id, authToken);
                 if (profile) {
                     const currentPoints = profile.points || 0;
                     let newPoints = currentPoints - bookToDelete.points;
                     if (newPoints < 0) newPoints = 0;

                     console.log(`[BookService] Deleting book "${bookToDelete.title}". Deducting ${bookToDelete.points} points. New Total: ${newPoints}`);
                     await ProfileModel.updatePoints(bookToDelete.owner_id, newPoints, authToken);
                 }
            }
        } catch (e) {
            console.error('[BookService] Error processing points deduction on delete:', e);
            // We continue with deletion even if points fail, or should we stop?
            // Usually safest to log and continue deletion to avoid "undeletable" books.
        }

        // 1. Get image URLs associated with the book before deleting
        const client = (await import('../config/supabaseClient.js')).getSupabaseClient(authToken);
        
        try {
            const { data: images } = await client
                .from('book_images')
                .select('image_url')
                .eq('book_id', bookId);

            console.log('BookService: Found images to delete:', images);

            if (images && images.length > 0) {
                // Extract file paths from URLs
                // URL Format: .../storage/v1/object/public/hackathon/filename.ext
                const filesToRemove = images.map(img => {
                    const url = img.image_url;
                    try {
                        console.log('BookService: Processing URL:', url);
                        // Split by bucket name 'hackathon'
                        const parts = url.split('/hackathon/');
                        if (parts.length === 2) {
                            console.log('BookService: Extracted path:', parts[1]);
                            return parts[1]; // The file path
                        } else {
                            console.warn('BookService: URL did not match expected format with /hackathon/', url);
                        }
                    } catch (e) { console.error('Error parsing url', url); }
                    return null;
                }).filter(path => path !== null);

                if (filesToRemove.length > 0) {
                    console.log('BookService: Attempting to delete from storage:', filesToRemove);
                    const { data: storageData, error: storageError } = await client.storage
                        .from('hackathon')
                        .remove(filesToRemove);
                    
                    if (storageError) {
                        console.error('BookService: Error removing files from storage:', storageError);
                    } else {
                        console.log('BookService: Storage remove result:', storageData);
                    }
                } else {
                     console.log('BookService: No valid file paths to remove.');
                }
            } else {
                console.log('BookService: No images found in DB for this book.');
            }
        } catch (err) {
            console.error('Error in image deletion process:', err);
             // Proceed to delete book anyway
        }

        return await BookModel.deleteBook(bookId, authToken);
    }
}

export default new BookService();
