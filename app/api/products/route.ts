import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { verifyAdmin } from '@/lib/admin-auth';

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

        // Stock Filtering
        const inStock = searchParams.get('inStock');
        if (inStock === 'true') {
            query += ` AND p.stock_quantity > 0`;
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

export async function POST(req: Request) {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const body = await req.json();
        const {
            name,
            slug,
            sku,
            description,
            price,
            stock_quantity,
            category_id,
            image_url,
            is_active,
            is_featured,
            cost_price,
            weight,
            width,
            height,
            depth,
            meta_title,
            meta_description,
            related_ids,
            hs_code,
            origin_country
        } = body;

        // Basic validation
        if (!name || !price || !sku) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate slug if not provided, and handle non-latin characters or empty names
        let finalSlug = slug || name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Keep alphanumeric and spaces/dashes
            .trim()
            .replace(/[-\s]+/g, '-'); // Replace spaces/dashes with single dash

        if (!finalSlug || finalSlug === '-') {
            finalSlug = `product-${Date.now()}`;
        }

        // Generate SKU if not provided
        const finalSku = sku || `YEM-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        const [result]: any = await pool.execute(
            `INSERT INTO products (
                name, slug, sku, description, price, stock_quantity, 
                category_id, brand_id, images, is_active, is_featured,
                cost_price, weight, width, height, depth, meta_title, meta_description,
                related_ids, hs_code, origin_country,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                name,
                finalSlug,
                finalSku,
                description || null,
                price,
                stock_quantity || 0,
                category_id || null,
                body.brand_id || null, // Capture brand_id from body
                image_url ? JSON.stringify([image_url]) : null,
                is_active !== undefined ? is_active : 1,
                is_featured !== undefined ? is_featured : 0,
                cost_price || null,
                weight || null,
                width || null,
                height || null,
                depth || null,
                meta_title || null,
                meta_description || null,
                related_ids || "[]",
                hs_code || null,
                origin_country || "Yemen"
            ]
        );

        return NextResponse.json({
            success: true,
            productId: result.insertId,
            message: 'Product created successfully'
        });

    } catch (error: any) {
        console.error('Product creation error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'SKU or Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
    }
}
