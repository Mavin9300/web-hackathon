import profileService from '../services/profileService.js';

class ProfileController {
    async getCurrentProfile(req, res) {
        try {
            const client = (await import('../config/supabaseClient.js')).getSupabaseClient(req.authToken);
            const { data: { user }, error } = await client.auth.getUser();

            if (error || !user) {
                throw new Error('Unauthorized');
            }

            const profile = await profileService.getProfile(user.id, req.authToken);
            res.json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getProfileStats(req, res) {
        try {
            const client = (await import('../config/supabaseClient.js')).getSupabaseClient(req.authToken);
            const { data: { user }, error } = await client.auth.getUser();

            if (error || !user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const stats = await profileService.getProfileStats(user.id, req.authToken);
            res.json(stats);
        } catch (error) {
            console.error('[ProfileController] getProfileStats Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async createProfile(req, res) {
        try {
            console.log('Create Profile Request Body:', req.body);
            console.log('Auth Token:', req.authToken ? 'Present' : 'Missing');

            const client = (await import('../config/supabaseClient.js')).getSupabaseClient(req.authToken);
            const { data: { user }, error } = await client.auth.getUser();

            if (error || !user) {
                console.error('Auth User Error:', error);
                throw new Error('Unauthorized');
            }

            console.log('Authenticated User ID:', user.id);

            const profileData = {
                id: user.id,
                username: req.body.username, // Should be passed from frontend
                image_url: req.body.image_url,
                location: req.body.location
            };

            const newProfile = await profileService.createProfile(profileData, req.authToken);
            res.json(newProfile);
        } catch (error) {
            console.error('Create Profile Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.params.id;
            const profile = await profileService.getProfile(userId, req.authToken);
            res.json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            console.log('[ProfileController] updateProfile called');
            const userId = req.params.id;
            console.log(`[ProfileController] Target UserID: ${userId}`);
            console.log('[ProfileController] Request Body:', req.body);
            const updatedProfile = await profileService.updateProfile(userId, req.body, req.authToken);
            res.json(updatedProfile);
        } catch (error) {
            console.error('[ProfileController] updateProfile Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async deleteProfile(req, res) {
        try {
            const userId = req.params.id;
            await profileService.deleteProfile(userId, req.authToken);
            res.json({ message: 'Profile deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deductReputation(req, res) {
        try {
            const userId = req.params.id;
            const { amount = 5, reason = 'Abusive content detected' } = req.body;
            const profile = await profileService.deductReputation(userId, amount, reason, req.authToken);
            res.json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updatePoints(req, res) {
        try {
            const userId = req.params.id;
            const { points } = req.body;
            const profile = await profileService.updatePoints(userId, points, req.authToken);
            res.json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateReputation(req, res) {
        try {
            const userId = req.params.id;
            const { reputation } = req.body;
            const profile = await profileService.updateReputation(userId, reputation, req.authToken);
            res.json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async convertPointsToReputation(req, res) {
        try {
            const client = (await import('../config/supabaseClient.js')).getSupabaseClient(req.authToken);
            const { data: { user }, error } = await client.auth.getUser();

            if (error || !user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { points } = req.body;
            
            if (!points || points < 500 || points % 500 !== 0) {
                return res.status(400).json({ error: 'Points must be a multiple of 500 (minimum 500)' });
            }

            const reputationToAdd = (points / 500) * 5;
            const profile = await profileService.convertPointsToReputation(user.id, points, reputationToAdd, req.authToken);
            res.json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async checkReputationRequirement(req, res) {
        try {
            const client = (await import('../config/supabaseClient.js')).getSupabaseClient(req.authToken);
            const { data: { user }, error } = await client.auth.getUser();

            if (error || !user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { action } = req.query; // 'chat', 'forum', 'request'
            const profile = await profileService.getProfile(user.id, req.authToken);
            
            const requirements = {
                chat: 50,
                forum: 30,
                request: 20
            };

            const requiredReputation = requirements[action] || 0;
            const canPerformAction = profile.reputation >= requiredReputation;

            res.json({
                canPerformAction,
                currentReputation: profile.reputation,
                requiredReputation,
                deficit: canPerformAction ? 0 : requiredReputation - profile.reputation
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new ProfileController();
