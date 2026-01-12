import { getSupabaseClient } from '../config/supabaseClient.js';
import profileService from '../services/profileService.js';

class AuthController {
    async signup(req, res) {
        try {
            const { email, password } = req.body;
            
            // 1. SignUp with Supabase (using System Client to allow admin-like creation if needed, 
            // but standard signup is public. Using getSupabaseClient() without token uses anon/service key).
            const client = getSupabaseClient(); 
            const { data, error } = await client.auth.signUp({
                email,
                password
            });

            if (error) throw error;
            
            if (data.user) {
                // 2. Create Profile immediately using Service Key (System Client) OR User Token
                // If we have a session (auto-confirm), pass the token to satisfy RLS "Users can insert their own profile"
                const token = data.session ? data.session.access_token : null;
                const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

                if (token || hasServiceKey) {
                   const username = `${email.split('@')[0]}_${Date.now().toString().slice(-4)}`;
                   
                   await profileService.createProfile({
                       id: data.user.id,
                       username: username,
                       image_url: '',
                       location: ''
                   }, token);
                } else {
                    console.warn('Skipping manual profile creation: No session token and no SUPABASE_SERVICE_ROLE_KEY. Profile should be created by DB trigger if enabled.');
                }
            }

            res.json(data);
        } catch (error) {
            console.error('Signup Error:', error);
            if (error.message?.includes('row-level security')) {
                console.error('CRITICAL: Row-Level Security detected. This usually means the SUPABASE_SERVICE_ROLE_KEY is missing or invalid in backend/.env.');
            }
            res.status(400).json({ error: error.message });
        }
    }
}

export default new AuthController();
