import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(req: Request) {
    try {
        const query = `
            SELECT * FROM categories 
            ORDER BY display_order ASC, name ASC
        `;

        const [rows]: any = await pool.execute(query);

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Categories fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, slug, description, image_url, is_active, display_order } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Generate slug if not provided
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const query = `
            INSERT INTO categories (
                name, slug, description, image_url, is_active, display_order, 
                parent_id, meta_title, meta_description, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result]: any = await pool.execute(query, [
            name,
            finalSlug,
            description || null,
            image_url || null,
            is_active !== undefined ? is_active : 1,
            display_order || 0,
            body.parent_id || null,
            body.meta_title || null,
            body.meta_description || null
        ]);

        return NextResponse.json({
            success: true,
            id: result.insertId,
            message: 'Category created successfully'
        });

    } catch (error: any) {
        console.error('Category creation error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
