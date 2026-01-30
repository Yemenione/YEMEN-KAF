import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pool from '@/lib/mysql';

export async function GET() {
    const results: any = {
        prisma: { status: 'pending' },
        mysql: { status: 'pending' }
    };

    try {
        // Test Prisma
        await prisma.$queryRaw`SELECT 1`;
        results.prisma = { status: 'connected', message: 'Prisma successful' };
    } catch (error: any) {
        results.prisma = { status: 'error', message: error.message };
    }

    try {
        // Test MySQL Pool
        await pool.query('SELECT 1');
        results.mysql = { status: 'connected', message: 'MySQL successful' };
    } catch (error: any) {
        results.mysql = { status: 'error', message: error.message };
    }

    const isHealthy = results.prisma.status === 'connected' && results.mysql.status === 'connected';

    return NextResponse.json({
        healthy: isHealthy,
        details: results
    }, { status: isHealthy ? 200 : 500 });
}
