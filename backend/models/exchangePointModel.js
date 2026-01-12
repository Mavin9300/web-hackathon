import { getSupabaseClient } from '../config/supabaseClient.js';

class ExchangePointModel {
    static async createPoint(pointData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('exchange_stalls')
            .insert([pointData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async getAllPoints(authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('exchange_stalls')
            .select('*');

        if (error) {
            throw error;
        }
        return data;
    }

    static async updatePoint(pointId, updateData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('exchange_stalls')
            .update(updateData)
            .eq('id', pointId)
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }

    static async deletePoint(pointId, authToken) {
        const client = getSupabaseClient(authToken);
        const { error } = await client
            .from('exchange_stalls')
            .delete()
            .eq('id', pointId);

        if (error) {
            throw error;
        }
        return { success: true };
    }
}

export default ExchangePointModel;
