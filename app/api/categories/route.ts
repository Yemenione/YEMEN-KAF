import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const [categories] = await pool.execute<RowDataPacket[]>(
            `SELECT id, name, slug, description, image_url
            FROM categories
            WHERE is_active = 1
            ORDER BY display_order ASC, name ASC`
        );

        return NextResponse.json({ categories });

    } catch (error) {
        console.error('Categories fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
