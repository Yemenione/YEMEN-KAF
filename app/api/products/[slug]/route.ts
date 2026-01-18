import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import pool from '@/lib/mysql';

// GET: Handle both Admin (Fetch by ID) and Storefront (Fetch by Slug)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Check if slug is numeric (ID for Admin) or a string slug
        const isNumericId = /^\d+$/.test(slug);

        const product = await prisma.product.findFirst({
            where: isNumericId
                ? { id: parseInt(slug) }
                : { slug, isActive: true },
            include: {
                category: {
                    select: { name: true, slug: true }
                },
                variants: {
                    where: { isActive: true },
                    include: {
                        attributeValues: {
                            include: {
                                attributeValue: {
                                    include: { attribute: true }
                                }
                            }
                        }
                    },
                    orderBy: { price: 'asc' }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Transform for easier frontend consumption?
        // Let's return raw structure, frontend can parse.
        // Actually, let's map it slightly closer to what typical storefronts expect if needed.
        // But for consistency with existing simple object, keeping it raw is safer.
        // The existing frontend expects "product.category_name". Prisma returns "product.category.name".
        // I need to shim this.

        const responseProduct = {
            ...product,
            price: product.price.toNumber(), // Decimal to Number
            stock_quantity: product.stockQuantity, // camelCase vs snake_case mapping
            category_name: product.category?.name,
            category_slug: product.category?.slug,
            image_url: product.images ? JSON.parse(product.images)[0] : null, // Helper
            // Flatten variants for easier usage
            variants: product.variants.map((v: any) => ({
                ...v,
                price: v.price.toNumber(),
                attributes: v.attributeValues.map((av: any) => ({
                    name: av.attributeValue.attribute.publicName || av.attributeValue.attribute.name,
                    value: av.attributeValue.name,
                    type: av.attributeValue.attribute.type
                }))
            }))
        };

        return NextResponse.json({ product: responseProduct });

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
            'name', 'slug', 'sku', 'description', 'price',
            'compare_at_price',
            'stock_quantity', 'category_id', 'brand_id', 'images',
            'is_active', 'is_featured',
            'cost_price', 'weight', 'width', 'height', 'depth',
            'meta_title', 'meta_description', 'related_ids',
            'hs_code', 'origin_country',
            'tax_rule_id'
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
