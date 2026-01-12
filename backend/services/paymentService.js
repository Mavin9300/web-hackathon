import PaymentModel from '../models/paymentModel.js';

class PaymentService {
    async createPayment(userId, provider, amountPaid, pointsAdded, authToken) {
        if (!userId || !provider || !amountPaid || !pointsAdded) {
            throw new Error('User ID, provider, amount paid, and points added are required');
        }

        const paymentData = {
            user_id: userId,
            provider: provider,
            amount_paid: amountPaid,
            points_added: pointsAdded,
            status: 'pending'
        };

        return await PaymentModel.createPayment(paymentData, authToken);
    }
}

export default new PaymentService();
