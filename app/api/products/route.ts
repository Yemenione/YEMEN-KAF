import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = `
            SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
        `;

        const params: any[] = [];

        if (category && category !== 'all') {
            query += ` AND c.slug = ?`;
            params.push(category);
        }

        query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [products]: any = await pool.execute(query, params);

        return NextResponse.json({ products });

    } catch (error) {
        console.error('Products fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
