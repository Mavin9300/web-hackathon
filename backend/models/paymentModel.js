import { getSupabaseClient } from '../config/supabaseClient.js';

class PaymentModel {
    static async createPayment(paymentData, authToken) {
        const client = getSupabaseClient(authToken);
        const { data, error } = await client
            .from('payments')
            .insert([paymentData])
            .select();

        if (error) {
            throw error;
        }
        return data[0];
    }
}

export default PaymentModel;
