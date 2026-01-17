
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeSecrets = searchParams.get('includeSecrets') === 'true';

        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        // Secrets are only shown if explicitly requested AND authenticated
        const canSeeSecrets = !!token && includeSecrets;

        const configs = await prisma.storeConfig.findMany({
            where: canSeeSecrets ? {} : { isPublic: true },
            orderBy: { key: 'asc' }
        });

        const configMap = configs.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(configMap);

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch config', details: error.message },
            { status: 500 }
        );
    }
}

// Add a private GET for admin settings
export async function POST_GET_PRIVATE(req: NextRequest) {
    // This is just a conceptual note, I'll implement a proper private route or query param
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const settings = body.settings; // Expecting { key: value, ... }

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
        }

        const updates = Object.entries(settings).map(([key, value]) => {
            const isPublic = [
                'site_name', 'site_description', 'support_email', 'support_phone',
                'social_facebook', 'social_instagram', 'logo_url', 'primary_color',
                'stripe_publishable_key', 'paypal_client_id'
            ].includes(key);

            return prisma.storeConfig.upsert({
                where: { key },
                update: {
                    value: String(value),
                    isPublic: isPublic
                },
                create: {
                    key,
                    value: String(value),
                    type: 'text',
                    group: key.includes('stripe') || key.includes('paypal') ? 'payment' : 'general',
                    isPublic: isPublic
                }
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to save settings', details: error.message },
            { status: 500 }
        );
    }
}
