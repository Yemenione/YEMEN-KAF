
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { translations as staticTranslations } from '@/lib/translations';

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbTranslations = await (prisma as any).translation.findMany();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const merged: Record<string, any> = JSON.parse(JSON.stringify(staticTranslations));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbTranslations.forEach((t: any) => {
            const keys = t.key.split('.');
            let current = merged[t.language];
            if (!current) merged[t.language] = {};
            current = merged[t.language];

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = t.value;
        });

        return NextResponse.json(merged);
    } catch {
        return NextResponse.json(staticTranslations);
    }
}
