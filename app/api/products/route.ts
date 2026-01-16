import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sort = searchParams.get('sort') || 'newest';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

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

        const search = searchParams.get('search');
        if (search) {
            query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        // Price Filtering
        if (minPrice) {
            query += ` AND p.price >= ?`;
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ` AND p.price <= ?`;
            params.push(maxPrice);
        }

        // Sorting
        switch (sort) {
            case 'price-low':
                query += ` ORDER BY p.price ASC`;
                break;
            case 'price-high':
                query += ` ORDER BY p.price DESC`;
                break;
            case 'name-asc':
                query += ` ORDER BY p.name ASC`;
                break;
            case 'name-desc':
                query += ` ORDER BY p.name DESC`;
                break;
            case 'newest':
            default:
                query += ` ORDER BY p.created_at DESC`;
                break;
        }

        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [products]: any = await pool.execute(query, params);

        return NextResponse.json({ products });

    } catch (error) {
        console.error('Products fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
