import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const [rows]: any = await pool.execute(
            'SELECT * FROM categories WHERE id = ?',
            [params.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
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
        const body = await req.json();
        console.log('[PUT] Body:', body);
        const { name, slug, description, image_url, is_active, display_order } = body;

        // Build generic update query
        let updates: string[] = [];
        let values: any[] = [];

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

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(params.id);

        await pool.execute(
            `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return NextResponse.json({ success: true, message: 'Category updated' });

    } catch (error: any) {
        console.error('Category update error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Unlink products first to avoid Foreign Key Constraint failure
        await pool.execute('UPDATE products SET category_id = NULL WHERE category_id = ?', [params.id]);

        // Now delete the category
        await pool.execute('DELETE FROM categories WHERE id = ?', [params.id]);

        return NextResponse.json({ success: true, message: 'Category deleted' });
    } catch (error: any) {
        console.error("Delete Category Error:", error);
        return NextResponse.json({ error: 'Failed to delete category', details: error.message }, { status: 500 });
    }
}
