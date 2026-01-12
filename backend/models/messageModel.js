import { getSupabaseClient } from '../config/supabaseClient.js';

class MessageModel {
    static async createOrGetChat(user1Id, user2Id, authToken, bookId = null) {
        const client = getSupabaseClient(authToken);
        
        // Find existing chat between these two users
        // If bookId is provided, we should ideally find a chat linked to this book?
        // Or just a general chat? The requirement says "deleting a book will delete those too".
        // This implies chats should be scoped to a book if possible, OR we link the chat to the book.
        // If we want book-specific chats, we should include book_id in the lookup/creation.
        
        let query = client
            .from('chat_members')
            .select('chat_id')
            .in('user_id', [user1Id, user2Id]);

        const { data: existingMembers, error: findError } = await query;

        if (findError) {
            throw findError;
        }

        // Find chat_id that has both users
        if (existingMembers && existingMembers.length > 0) {
            const chatIds = existingMembers.map(m => m.chat_id);
            const chatIdCounts = {};
            chatIds.forEach(id => {
                chatIdCounts[id] = (chatIdCounts[id] || 0) + 1;
            });
            
            // Find chat with both users
            const commonChatIds = Object.keys(chatIdCounts).filter(id => chatIdCounts[id] === 2);
            
            if (commonChatIds.length > 0) {
                 // Check if any of these chats are linked to the book (if bookId provided)
                 // Or if bookId is NOT provided, finding any chat is fine?
                 // If bookId is provided, we prefer a chat with that bookId.
                 // If we strictly want separate chats per book, we must filter by book_id.
                 
                 const { data: chats, error: chatError } = await client
                    .from('chats')
                    .select('*')
                    .in('id', commonChatIds);

                 if (!chatError && chats) {
                     let match;
                     if (bookId) {
                         match = chats.find(c => c.book_id === bookId);
                     } else {
                         // If no bookId requested, prefer one without bookId, or just take the first one?
                         // Maybe just take the first one to keep it simple as "DM"
                         match = chats.find(c => !c.book_id) || chats[0];
                     }
                     
                     if (match) return match;
                 }
            }
        }

        // Create new chat
        const chatData = {};
        if (bookId) chatData.book_id = bookId;

        const { data: newChat, error: createError } = await client
            .from('chats')
            .insert([chatData])
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        // Add both users as members
        const { error: membersError } = await client
            .from('chat_members')
            .insert([
                { chat_id: newChat.id, user_id: user1Id },
                { chat_id: newChat.id, user_id: user2Id }
            ]);

        if (membersError) {
            throw membersError;
        }

        return newChat;
    }

    static async sendMessage(messageData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('messages')
            .insert([messageData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async getMessagesByChat(chatId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('messages')
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey (
                    username,
                    image_url
                )
            `)
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }
        return data;
    }

    static async getUserChats(userId, authToken) {
        const client = getSupabaseClient(authToken);
        
        // Get all chats where user is a member
        const { data: userChats, error: chatsError } = await client
            .from('chat_members')
            .select('chat_id')
            .eq('user_id', userId);

        if (chatsError) {
            throw chatsError;
        }

        if (!userChats || userChats.length === 0) {
            return [];
        }

        const chatIds = userChats.map(c => c.chat_id);

        // Get all members for these chats (to find the other user)
        const { data: allMembers, error: membersError } = await client
            .from('chat_members')
            .select('chat_id, user_id, profiles:user_id (id, username, image_url)')
            .in('chat_id', chatIds);

        if (membersError) {
            throw membersError;
        }

        // Get last message for each chat
        const { data: messages, error: messagesError } = await client
            .from('messages')
            .select('chat_id, content, created_at')
            .in('chat_id', chatIds)
            .order('created_at', { ascending: false });

        if (messagesError) {
            throw messagesError;
        }

        // Build chat list with other user info and last message
        const chatList = chatIds.map(chatId => {
            const members = allMembers.filter(m => m.chat_id === chatId);
            const otherUser = members.find(m => m.user_id !== userId);
            const lastMessage = messages.find(m => m.chat_id === chatId);

            return {
                id: chatId,
                otherUser: otherUser?.profiles || { username: 'Unknown User' },
                lastMessage: lastMessage?.content || 'No messages yet',
                lastMessageTime: lastMessage?.created_at || null
            };
        });

        return chatList;
    }
}

export default MessageModel;
