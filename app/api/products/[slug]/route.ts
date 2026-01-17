import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { verifyAdmin } from '@/lib/admin-auth';

// GET: Handle both Admin (Fetch by ID) and Storefront (Fetch by Slug)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Check if slug is numeric (ID for Admin) or a string slug
        const isNumericId = /^\d+$/.test(slug);

        let query = '';
        let queryParams = [];

        if (isNumericId) {
            // Admin: Fetch by ID
            query = `
                SELECT 
                    p.*,
                    c.name as category_name,
                    c.slug as category_slug
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?
            `;
            queryParams = [slug];
        } else {
            // Storefront: Fetch by Slug (Active only)
            query = `
                SELECT 
                    p.*,
                    c.name as category_name,
                    c.slug as category_slug
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.slug = ? AND p.is_active = 1
                LIMIT 1
            `;
            queryParams = [slug];
        }

        const [rows]: any = await pool.execute(query, queryParams);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ product: rows[0] });

    } catch (error) {
        console.error('Product fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

// UPDATE Product (Admin - uses ID)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const { slug } = await params;
        const id = slug; // Rename for clarity, assuming ID passed

        const body = await req.json();

        // Dynamic query building
        const updates: string[] = [];
        const values: any[] = [];

        // Whitelist allowed fields
        const allowedFields = [
            'name', 'slug', 'sku', 'description', 'price',
            'stock_quantity', 'category_id', 'brand_id', 'images',
            'is_active', 'is_featured',
            'cost_price', 'weight', 'width', 'height', 'depth',
            'meta_title', 'meta_description', 'related_ids',
            'hs_code', 'origin_country'
        ];

        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        updates.push('updated_at = NOW()');

        const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);

        const [result]: any = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Product updated successfully' });

    } catch (error: any) {
        console.error('Product update error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'SKU or Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE Product (Admin - uses ID)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const { slug } = await params;
        const id = slug; // Rename for clarity

        try {
            const [result]: any = await pool.execute('DELETE FROM products WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: 'Product deleted successfully' });

        } catch (dbError: any) {
            if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
                // Fallback to soft delete if referenced
                await pool.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
                return NextResponse.json({ success: true, message: 'Product archived (soft deleted) due to existing orders' });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('Product delete error:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
