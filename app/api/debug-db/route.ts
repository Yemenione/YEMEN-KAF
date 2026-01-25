import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET() {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 AS result');
        return NextResponse.json({
            status: 'Connected ✅',
            database_url_present: !!process.env.DATABASE_URL,
            result: rows
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'Failed ❌',
            error: error.message,
            code: error.code,
            stack: error.stack
        }, { status: 500 });
    }
}
