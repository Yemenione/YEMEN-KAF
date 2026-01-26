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

        const configMap = configs.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(configMap);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch config', details: errorMessage },
            { status: 500 }
        );
    }
}

// ...

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
                'store_email', 'store_phone', 'store_address',
                'social_facebook', 'social_instagram', 'social_whatsapp', 'social_twitter',
                'social_tiktok', 'social_youtube', 'social_snapchat', 'social_linkedin',
                'logo_url', 'primary_color',
                'stripe_publishable_key', 'paypal_client_id',
                'homepage_hero_products', 'homepage_featured_categories',
                'homepage_flash_sale_product_ids', 'homepage_flash_sale_end_date',
                'homepage_flash_sale_ends_soon_text', 'homepage_promo_grid',
                'homepage_special_offers_ids', 'homepage_best_sellers_ids',
                'ramadan_mode_enabled', 'ramadan_title', 'ramadan_subtitle', 'ramadan_product_ids',
                'menu_main', 'menu_footer_links',
                'marquee_text_en', 'marquee_text_fr', 'marquee_text_ar', 'marquee_enabled',
                'support_faq_json', 'live_chat_url', 'terms_url', 'privacy_url', 'about_url',
                'app_splash_url', 'app_banner_honey_url', 'app_banner_coffee_url'
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

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to save settings', details: errorMessage },
            { status: 500 }
        );
    }
}
