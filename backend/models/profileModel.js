import { getSupabaseClient } from '../config/supabaseClient.js';

class ProfileModel {
    static async getProfile(userId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw error;
        }
        return data;
    }

    static async getProfileStats(userId, authToken) {
        const client = getSupabaseClient(authToken);
        
        // 1. Get Profile (Points & Reputation)
        const profilePromise = client
            .from('profiles')
            .select('points, reputation')
            .eq('id', userId)
            .single();

        // 2. Get Total Books owned
        const booksPromise = client
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', userId);

        // 3. Get Exchanges (where user is sender or receiver)
        const exchangesPromise = client
            .from('exchanges')
            .select('*', { count: 'exact', head: true })
            .or(`from_user.eq.${userId},to_user.eq.${userId}`);

        const [profileResult, booksResult, exchangesResult] = await Promise.all([
            profilePromise,
            booksPromise,
            exchangesPromise
        ]);

        if (profileResult.error) throw profileResult.error;
        // booksResult.error can be null if count is 0, so careful. head:true returns null data but valid count/error.
        if (booksResult.error) throw booksResult.error; 
        if (exchangesResult.error) throw exchangesResult.error;

        return {
            points: profileResult.data?.points || 0,
            reputation: profileResult.data?.reputation || 100,
            total_books: booksResult.count || 0,
            exchanges: exchangesResult.count || 0
        };
    }

    static async createProfile(profileData, authToken) {
        console.log(`[ProfileModel] createProfile (Upsert) - User: ${profileData.id}, Token present: ${!!authToken}`);
        // Use auth token if available (User-Context), otherwise fallback to configured client (likely Anon or Service)
        const client = getSupabaseClient(authToken); 
        const { data, error } = await client
            .from('profiles')
            .upsert([profileData], { onConflict: 'id' })
            .select();

        if (error) {
            console.error('[ProfileModel] createProfile Error:', error);
            throw error;
        }
        console.log('[ProfileModel] createProfile Success:', data ? 'Data returned' : 'No data');
        return data[0];
    }

    static async updateProfile(userId, profileData, authToken) {
        console.log(`[ProfileModel] updateProfile - User: ${userId}, Token present: ${!!authToken}`);
        // Use auth token to identify as the user
        const client = getSupabaseClient(authToken); 
        const { data, error } = await client
            .from('profiles')
            .update(profileData)
            .eq('id', userId)
            .select();

        if (error) {
            console.error('[ProfileModel] updateProfile Error:', error);
            throw error;
        }
        console.log('[ProfileModel] updateProfile Success:', data ? 'Data returned' : 'No data');
        return data[0];
    }

    static async deleteProfile(userId, authToken) {
        const client = getSupabaseClient(authToken);

        // 1. Delete Profile Image from Storage if exists
        try {
             // Logic: We need to know the image path. 
             // We can fetch the profile first to get image_url or blindly try to delete if we follow a naming convention (e.g. userId.jpg) 
             // but convention isn't guaranteed. Best to fetch.
             const { data: profile } = await client
                 .from('profiles')
                 .select('image_url')
                 .eq('id', userId)
                 .single();

             if (profile && profile.image_url) {
                 const url = profile.image_url;
                 console.log('[ProfileModel] Processing Profile Image URL for delete:', url);
                 const parts = url.split('/hackathon/');
                 if (parts.length === 2) {
                     const filePath = parts[1];
                     console.log('[ProfileModel] Attempting to delete profile image:', filePath);
                     const { error: storageError } = await client.storage
                         .from('hackathon')
                         .remove([filePath]);
                     
                     if (storageError) console.error('[ProfileModel] Storage delete error:', storageError);
                 }
             }
        } catch (e) {
            console.error('[ProfileModel] Error clearing profile storage:', e);
        }

        // 2. Delete Profile Row (Cascade will handle the rest)
        const { error } = await client
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            throw error;
        }
        return { success: true };
    }

    static async deductReputation(userId, amount, reason, authToken) {
        const client = getSupabaseClient(authToken);
        
        // Get current reputation
        const { data: profile, error: getError } = await client
            .from('profiles')
            .select('reputation')
            .eq('id', userId)
            .single();

        if (getError) {
            throw getError;
        }

        const newReputation = (profile.reputation || 100) - amount;

        // Update reputation
        const { data, error } = await client
            .from('profiles')
            .update({ reputation: newReputation })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        // Optionally log the deduction (you could add a reputation_log table)
        console.log(`Reputation deducted: User ${userId}, -${amount}, Reason: ${reason}`);

        return data[0];
    }

    static async updatePoints(userId, points, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('profiles')
            .update({ points: points })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async updateReputation(userId, reputation, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('profiles')
            .update({ reputation: reputation })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async convertPointsToReputation(userId, pointsToConvert, reputationToAdd, authToken) {
        const client = getSupabaseClient(authToken);
        
        // Get current points and reputation
        const { data: profile, error: getError } = await client
            .from('profiles')
            .select('points, reputation')
            .eq('id', userId)
            .single();

        if (getError) {
            throw getError;
        }

        const currentPoints = profile.points || 0;
        const currentReputation = profile.reputation || 100;

        if (currentPoints < pointsToConvert) {
            throw new Error(`Insufficient points. You have ${currentPoints} points but need ${pointsToConvert}`);
        }

        const newPoints = currentPoints - pointsToConvert;
        const newReputation = currentReputation + reputationToAdd;

        // Update both points and reputation
        const { data, error } = await client
            .from('profiles')
            .update({ 
                points: newPoints,
                reputation: newReputation
            })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }
}

export default ProfileModel;
