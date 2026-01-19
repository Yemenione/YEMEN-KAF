import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

interface ProductSearchRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
    price: string;
    images: string | string[] | null;
    category_name: string;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Search products by name
        const [products] = await pool.execute<ProductSearchRow[]>(
            `SELECT 
                p.id,
                p.name,
                p.slug,
                p.price,
                p.images,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1 
            AND (p.name LIKE ? OR p.description LIKE ?)
            LIMIT 8`,
            [`%${query}%`, `%${query}%`]
        );

        // Parse images for each product
        const results = products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: parseFloat(p.price),
            image: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images)[0] : (Array.isArray(p.images) ? p.images[0] : null)) : null,
            category: p.category_name
        }));

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
