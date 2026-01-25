import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSecretConfig } from '@/lib/config';

async function getStripeClient() {
    const secretKey = await getSecretConfig('stripe_secret_key');
    return new Stripe(secretKey, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: '2024-12-18.acacia' as any,
    });
}

export async function POST(req: Request) {
    try {
        const { amount, currency = 'eur', successUrl, cancelUrl } = await req.json();
        const stripe = await getStripeClient();

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Order from Yemeni Market',
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        });

        return NextResponse.json({
            url: session.url,
            id: session.id,
        });
    } catch (error) {
        console.error('Stripe Session error:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = (error as any).message || 'Internal Server Error';
        return NextResponse.json(
            { error: msg },
            { status: 500 }
        );
    }
}
