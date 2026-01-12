import express from 'express';
import supabase from './config/supabaseClient.js';

const router = express.Router();

router.post('/dev-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            return res.status(401).json({ error: error.message });
        }
        
        res.json({
            message: 'Login successful! Copy the access_token below',
            access_token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email
            },
            usage: {
                postman_header_key: 'Authorization',
                postman_header_value: `Bearer ${data.session.access_token}`
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
