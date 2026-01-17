
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { translations as staticTranslations } from '@/lib/translations';

export async function GET(req: NextRequest) {
    try {
        // 1. Get from DB
        const dbTranslations = await (prisma as any).translation.findMany();

        // 2. If DB is empty, or if specifically requested, return static + option to sync
        // For now, let's just return a merged structure
        const result: any = {};

        // Helper to flatten static translations
        const flatten = (obj: any, prefix = '') => {
            let items: any = {};
            for (const key in obj) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    Object.assign(items, flatten(obj[key], newKey));
                } else {
                    items[newKey] = obj[key];
                }
            }
            return items;
        };

        const staticEn = flatten(staticTranslations.en);
        const staticFr = flatten(staticTranslations.fr);
        const staticAr = flatten(staticTranslations.ar);

        const allKeys = new Set([...Object.keys(staticEn), ...dbTranslations.map(t => t.key)]);

        allKeys.forEach(key => {
            result[key] = {
                en: dbTranslations.find(t => t.key === key && t.language === 'en')?.value || staticEn[key] || '',
                fr: dbTranslations.find(t => t.key === key && t.language === 'fr')?.value || staticFr[key] || '',
                ar: dbTranslations.find(t => t.key === key && t.language === 'ar')?.value || staticAr[key] || '',
            };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { key, language, value, group = 'frontend' } = await req.json();

        if (!key || !language || value === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const translation = await (prisma as any).translation.upsert({
            where: {
                group_key_language: {
                    group,
                    key,
                    language
                }
            },
            update: { value },
            create: {
                group,
                key,
                language,
                value
            }
        });

        return NextResponse.json(translation);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
