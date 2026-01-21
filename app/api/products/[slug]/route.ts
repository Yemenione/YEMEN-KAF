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
                carriers: true,
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
            carriers: product.carriers,
            // Flatten variants for easier usage
            // Flatten variants for easier usage
            variants: product.variants.map((v) => ({
                ...v,
                price: v.price.toNumber(),
                attributes: v.attributeValues.map((av) => ({
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
        const id = parseInt(slug);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const body = await req.json();

        // Destructure known fields to ensure type safety and only update what is allowed
        const {
            name, slug: newSlug, sku, description, price,
            stock_quantity, category_id, brand_id, images,
            is_active, is_featured,
            cost_price, weight, width, height, depth,
            meta_title, meta_description, related_ids,
            compare_at_price, hs_code, origin_country,
            tax_rule_id, carriers, translations
        } = body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                slug: newSlug,
                sku,
                description,
                price: price !== undefined ? parseFloat(price) : undefined,
                stockQuantity: stock_quantity !== undefined ? parseInt(stock_quantity) : undefined,
                categoryId: category_id ? parseInt(category_id) : null,
                brandId: brand_id ? parseInt(brand_id) : null,
                images: images ? (Array.isArray(images) ? JSON.stringify(images) : images) : undefined,
                isActive: is_active,
                isFeatured: is_featured,
                costPrice: cost_price !== undefined ? parseFloat(cost_price) : undefined,
                weight: weight !== undefined ? parseFloat(weight) : undefined,
                width: width !== undefined ? parseFloat(width) : undefined,
                height: height !== undefined ? parseFloat(height) : undefined,
                depth: depth !== undefined ? parseFloat(depth) : undefined,
                metaTitle: meta_title,
                metaDescription: meta_description,
                relatedIds: related_ids,
                compareAtPrice: compare_at_price !== undefined ? parseFloat(compare_at_price) : undefined,
                hsCode: hs_code,
                originCountry: origin_country,
                translations: translations,
                taxRuleId: tax_rule_id ? parseInt(tax_rule_id) : null,
                carriers: carriers ? {
                    set: Array.isArray(carriers) ? carriers.map((cid: string | number) => ({ id: parseInt(cid.toString()) })) : []
                } : undefined
            }
        });

        return NextResponse.json({ success: true, message: 'Product updated successfully', product: updatedProduct });

    } catch (error) {
        console.error('Product update error:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = error as any;
        if (e.code === 'P2002') {
            return NextResponse.json({ error: 'SKU or Slug already exists' }, { status: 409 });
        }
        if (e.code === 'P2025') {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE Product (Admin - uses ID)
import { ResultSetHeader } from 'mysql2';

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
            const [result] = await pool.execute<ResultSetHeader>('DELETE FROM products WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: 'Product deleted successfully' });

        } catch (dbError) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const e = dbError as any;
            if (e.code === 'ER_ROW_IS_REFERENCED_2') {
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
