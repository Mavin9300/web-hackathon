import { getSupabaseClient } from '../config/supabaseClient.js';

class ExchangeModel {
    static async createExchange(exchangeData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('exchanges')
            .insert([exchangeData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async updateExchange(exchangeId, updateData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('exchanges')
            .update(updateData)
            .eq('id', exchangeId)
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async getUserExchanges(userId, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('exchanges')
            .select('*')
            .or(`from_user.eq.${userId},to_user.eq.${userId}`);

        if (error) {
            throw error;
        }
        return data;
    }
}

export default ExchangeModel;
