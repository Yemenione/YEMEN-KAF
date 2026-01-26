import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AppConfigRow {
    key: string;
    value: string;
}

export async function GET() {
    try {
        const configs = await prisma.$queryRawUnsafe<AppConfigRow[]>(`SELECT * FROM app_configs`);

        // Transform array to object for easier consumption by App
        const configMap: Record<string, string | object> = {};
        configs.forEach((c) => {
            try {
                let parsed = JSON.parse(c.value);

                // Security: Strip sensitive fields from specific objects
                if (c.key === 'stripe_config') {
                    const { secretKey, ...publicStripe } = parsed;
                    parsed = publicStripe;
                }

                configMap[c.key] = parsed;
            } catch {
                // Security: Hide high-level secret keys
                if (['stripe_secret_key', 'api_secret'].includes(c.key)) return;
                configMap[c.key] = c.value;
            }
        });

        return NextResponse.json({ success: true, config: configMap });
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ error: error.message || 'Failed to load config' }, { status: 500 });
    }
}
