import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch raw configs for Admin Form
export async function GET() {
    try {
        const configs = await prisma.$queryRawUnsafe(`SELECT * FROM app_configs`);
        return NextResponse.json({ success: true, configs });
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Update a config
export async function POST(req: Request) {
    try {
        const { key, value } = await req.json();
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

        // Raw SQL fallback because Prisma Generate might be locked on Windows
        await prisma.$executeRawUnsafe(
            `INSERT INTO app_configs (\`key\`, \`value\`, \`updated_at\`, \`created_at\`) 
             VALUES (?, ?, NOW(), NOW()) 
             ON DUPLICATE KEY UPDATE \`value\` = ?, \`updated_at\` = NOW()`,
            key, stringValue, stringValue
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        const error = e as Error;
        console.error('AppConfig Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
