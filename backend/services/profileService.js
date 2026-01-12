import ProfileModel from '../models/profileModel.js';
import geocodingService from './geocodingService.js';

class ProfileService {
    async getProfile(userId, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await ProfileModel.getProfile(userId, authToken);
    }

    async getProfileStats(userId, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await ProfileModel.getProfileStats(userId, authToken);
    }

    async createProfile(profileData, authToken) {
        if (!profileData.id || !profileData.username) {
            throw new Error('User ID and Username are required');
        }

        // Geocode location if provided
        if (profileData.location) {
            const coords = await geocodingService.getCoordinates(profileData.location);
            if (coords) {
                profileData.latitude = coords.latitude;
                profileData.longitude = coords.longitude;
            }
        }

        return await ProfileModel.createProfile(profileData, authToken);
    }

    async updateProfile(userId, updates, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        // Geocode location if it is being updated
        if (updates.location) {
            console.log('[ProfileService] Location update detected:', updates.location);
            const coords = await geocodingService.getCoordinates(updates.location);
            console.log('[ProfileService] Geocoding result:', coords);
            if (coords) {
                updates.latitude = coords.latitude;
                updates.longitude = coords.longitude;
            } else {
                console.warn('[ProfileService] Geocoding failed for location:', updates.location);
            }
        }

        // Prepare data for upsert
        // We accept all updates, plus ensure ID is set.
        const profileData = {
            id: userId,
            ...updates
        };

        // Use createProfile (which does upsert) to ensure profile exists
        const updatedProfile = await ProfileModel.createProfile(profileData, authToken);

        // If location was updated, cascade to all books owned by this user
        if (updates.location && updatedProfile) {
            try {
                const client = (await import('../config/supabaseClient.js')).getSupabaseClient(authToken);
                const bookUpdates = {
                    location: updatedProfile.location,
                    latitude: updatedProfile.latitude,
                    longitude: updatedProfile.longitude
                };

                console.log('[ProfileService] Cascading location update to books:', bookUpdates);

                const { error: bookError } = await client
                    .from('books')
                    .update(bookUpdates)
                    .eq('owner_id', userId);

                if (bookError) {
                    console.error('[ProfileService] Failed to cascade update to books:', bookError);
                } else {
                    console.log('[ProfileService] Successfully updated user books with new location.');
                }
            } catch (err) {
                console.error('[ProfileService] Error in cascading book update:', err);
            }
        }

        return updatedProfile;
    }

    async deleteProfile(userId, authToken) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await ProfileModel.deleteProfile(userId, authToken);
    }

    async deductReputation(userId, amount, reason, authToken) {
        if (!userId || !amount) {
            throw new Error('User ID and amount are required');
        }
        return await ProfileModel.deductReputation(userId, amount, reason, authToken);
    }

    async updatePoints(userId, points, authToken) {
        if (!userId || points === undefined) {
            throw new Error('User ID and points are required');
        }
        return await ProfileModel.updatePoints(userId, points, authToken);
    }

    async updateReputation(userId, reputation, authToken) {
        if (!userId || reputation === undefined) {
            throw new Error('User ID and reputation are required');
        }
        return await ProfileModel.updateReputation(userId, reputation, authToken);
    }

    async convertPointsToReputation(userId, pointsToConvert, reputationToAdd, authToken) {
        if (!userId || !pointsToConvert || !reputationToAdd) {
            throw new Error('User ID, points, and reputation are required');
        }
        return await ProfileModel.convertPointsToReputation(userId, pointsToConvert, reputationToAdd, authToken);
    }
}

export default new ProfileService();
