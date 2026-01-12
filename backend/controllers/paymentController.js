import paymentService from '../services/paymentService.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import ProfileModel from '../models/profileModel.js';
import PaymentModel from '../models/paymentModel.js';
import { getSupabaseClient } from '../config/supabaseClient.js';

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("Stripe key is missing. Payments will not work.");
}

const PACKAGES = {
    'POINTS_100': { amount: 100, points: 100, name: '100 Points' }, // $1.00
    'POINTS_500': { amount: 450, points: 500, name: '500 Points' }, // $4.50
    'POINTS_1000': { amount: 800, points: 1000, name: '1000 Points' }, // $8.00
};

class PaymentController {
    async createPayment(req, res) {
        try {
            const { user_id, provider, amount_paid, points_added } = req.body;
            // Legacy/Manual payment recording if needed
            const payment = await paymentService.createPayment(user_id, provider, amount_paid, points_added, req.authToken);
            res.status(201).json(payment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async createCheckoutSession(req, res) {
        try {
            const { packageId } = req.body;
            
            // Validate Token and Get User
            const supabase = getSupabaseClient(req.authToken);
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }

            const userId = user.id;

            const pkg = PACKAGES[packageId];
            if (!pkg) {
                return res.status(400).json({ error: 'Invalid package ID' });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: pkg.name,
                            },
                            unit_amount: pkg.amount,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/buy-points`,
                metadata: {
                    userId: userId,
                    points: pkg.points,
                    packageId: packageId
                }
            });

            res.json({ sessionId: session.id, url: session.url });
        } catch (error) {
            console.error('Stripe Checkout Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async verifySession(req, res) {
        try {
            const { sessionId } = req.body;
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.payment_status === 'paid') {
                const userId = session.metadata.userId;
                const points = parseInt(session.metadata.points, 10);
                
                // 1. Record Payment
                try {
                    await PaymentModel.createPayment({
                        user_id: userId,
                        provider: 'stripe',
                        amount_paid: session.amount_total / 100,
                        points_added: points,
                        status: 'completed' 
                    }, req.authToken); 
                } catch (e) {
                    console.log('Payment record might already exist or schema mismatch:', e.message);
                }

                // 2. Add Points to User Profile
                const profile = await ProfileModel.getProfile(userId, req.authToken);
                const newPoints = (profile.points || 0) + points;
                await ProfileModel.updatePoints(userId, newPoints, req.authToken);

                res.json({ success: true, pointsAdded: points, newTotal: newPoints });
            } else {
                res.status(400).json({ error: 'Payment not successful' });
            }
        } catch (error) {
            console.error('Verify Session Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new PaymentController();
