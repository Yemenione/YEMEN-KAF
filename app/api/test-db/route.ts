import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Just try a simple query
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ status: 'connected', message: 'Database connection successful' });
    } catch (error: any) {
        console.error('Database Connection Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 });
    }
}
