import { NextResponse } from 'next/server';
import { verifyPermission } from '@/lib/admin-auth';
import { Permission } from '@/lib/rbac';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET(
    _req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { authorized, response } = await verifyPermission(Permission.MANAGE_CATEGORIES);
        if (!authorized) return response;
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM categories WHERE id = ?',
            [params.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    console.log('[PUT] Category ID:', params.id);
    try {
        const { authorized, response } = await verifyPermission(Permission.MANAGE_CATEGORIES);
        if (!authorized) return response;
        const body = await req.json();
        console.log('[PUT] Body:', body);
        const { name, slug, description, image_url, is_active, display_order } = body;

        // Build generic update query
        const updates: string[] = [];
        const values: (string | number | boolean)[] = [];

        if (updates.length === 0 && !body.parent_id && !body.meta_title) {
            // Basic check, logic below handles specific fields
        }

        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (slug !== undefined) { updates.push('slug = ?'); values.push(slug); }
        if (description !== undefined) { updates.push('description = ?'); values.push(description); }
        if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }
        if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
        if (display_order !== undefined) { updates.push('display_order = ?'); values.push(display_order); }

        // New Fields
        if (body.parent_id !== undefined) { updates.push('parent_id = ?'); values.push(body.parent_id); }
        if (body.meta_title !== undefined) { updates.push('meta_title = ?'); values.push(body.meta_title); }
        if (body.meta_description !== undefined) { updates.push('meta_description = ?'); values.push(body.meta_description); }
        if (body.translations !== undefined) { updates.push('translations = ?'); values.push(JSON.stringify(body.translations)); }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(params.id);

        await pool.execute(
            `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return NextResponse.json({ success: true, message: 'Category updated' });

    } catch (error) {
        console.error('Category update error:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { authorized, response } = await verifyPermission(Permission.MANAGE_CATEGORIES);
        if (!authorized) return response;
        // Unlink products first to avoid Foreign Key Constraint failure
        await pool.execute('UPDATE products SET category_id = NULL WHERE category_id = ?', [params.id]);

        // Now delete the category
        await pool.execute('DELETE FROM categories WHERE id = ?', [params.id]);

        return NextResponse.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error("Delete Category Error:", error);
        return NextResponse.json({ error: 'Failed to delete category', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
