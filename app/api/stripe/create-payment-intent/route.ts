
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSecretConfig } from '@/lib/config';

async function getStripeClient() {
    const secretKey = await getSecretConfig('stripe_secret_key');
    return new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia' as any,
    });
}

export async function POST(req: Request) {
    try {
        const { amount, currency = 'eur' } = await req.json();
        const stripe = await getStripeClient();

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
