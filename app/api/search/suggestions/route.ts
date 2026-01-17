import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const sql = `
            SELECT id, name, slug, price, images 
            FROM products 
            WHERE name LIKE ? OR description LIKE ? 
            LIMIT 5
        `;
        const values = [`%${query}%`, `%${query}%`];

        const [rows]: any = await pool.execute(sql, values);

        return NextResponse.json({ suggestions: rows });
    } catch (error) {
        console.error('Search suggestions error:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
