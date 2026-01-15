import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        console.log('Testing Prisma connection...');
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('Prisma connection failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            env: {
                HAS_DATABASE_URL: !!process.env.DATABASE_URL,
                DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : 'none'
            }
        }, { status: 500 });
    }
}
