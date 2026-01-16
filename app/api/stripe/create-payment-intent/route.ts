
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize with a fallback to prevent crash on import if env is missing, 
// but we will check for validity inside the handler.
const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || 'sk_test_placeholder';
const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-12-18.acacia' as any,
});

function isStripeKeyInvalid(key: string | undefined) {
    if (!key) return true;
    const k = key.trim();
    return k === '' || k === 'sk_test_placeholder' || k.startsWith('sk_test_...');
}

export async function POST(req: Request) {
    try {
        const { amount, currency = 'eur' } = await req.json();

        // Check against the actual env var or the effective key
        if (isStripeKeyInvalid(process.env.STRIPE_SECRET_KEY) && isStripeKeyInvalid(stripeKey)) {
            console.warn('Stripe is not configured correctly. Payment intent creation skipped. Key Status:', {
                configured: !!process.env.STRIPE_SECRET_KEY,
                key: stripeKey.substring(0, 10) + '...'
            });
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
        }

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Stripe error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
