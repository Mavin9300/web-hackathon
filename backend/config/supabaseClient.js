import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API;

let instance = null;
let authenticatedInstances = new Map();

const getSupabaseClient = (authToken) => {
    if (authToken) {
        if (!authenticatedInstances.has(authToken)) {
            authenticatedInstances.set(authToken, createClient(supabaseUrl, supabaseKey, {
                global: {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            }));
        }
        return authenticatedInstances.get(authToken);
    }
    
    if (!instance) {
        instance = createClient(supabaseUrl, supabaseKey);
    }
    return instance;
};

export { getSupabaseClient };
export default getSupabaseClient();
