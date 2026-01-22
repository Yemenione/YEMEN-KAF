import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM newsletter_subscribers ORDER BY created_at DESC'
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Failed to fetch subscribers:', error);
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
}
