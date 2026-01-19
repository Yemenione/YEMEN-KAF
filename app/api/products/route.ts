import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { verifyAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { RowDataPacket } from 'mysql2';
import { Prisma } from '@prisma/client';

interface ProductRow extends RowDataPacket {
    id: number;
    name: string;
    description: string;
    price: string;
    category_name: string;
    category_slug: string;
    stock_quantity: number;
    created_at: Date;
    is_active: number;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url); // Restored logic starts here
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

        const params: (string | number)[] = [];

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

        const [products] = await pool.execute<ProductRow[]>(query, params);

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
            compare_at_price,
            stock_quantity,
            category_id,
            brand_id,
            supplier_id,
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
            origin_country,
            variants // Array of { sku, price, stock, attributes: { Size: "L", Color: "Red" } }
        } = body;

        // Basic validation
        if (!name || !price) {
            return NextResponse.json({ error: 'Missing required fields: name, price' }, { status: 400 });
        }

        // Generate slug if not provided
        let finalSlug = slug || name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[-\s]+/g, '-');

        if (!finalSlug || finalSlug === '-') {
            finalSlug = `product-${Date.now()}`;
        }

        // Generate SKU if not provided
        const finalSku = sku || `YEM-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        // Use Prisma Transaction to create Product and potentially Variants
        // We import prisma from lib (needs to be added to imports)
        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    name,
                    slug: finalSlug,
                    sku: finalSku,
                    description,
                    price: parseFloat(price),
                    compareAtPrice: compare_at_price ? parseFloat(compare_at_price) : null,
                    stockQuantity: parseInt(stock_quantity || '0'),
                    categoryId: category_id ? parseInt(category_id) : null,
                    taxRuleId: body.tax_rule_id ? parseInt(body.tax_rule_id) : null,
                    brandId: brand_id ? parseInt(brand_id) : null,
                    supplierId: supplier_id ? parseInt(supplier_id) : null,
                    images: image_url ? JSON.stringify([image_url]) : null,
                    isActive: is_active !== undefined ? is_active : true,
                    isFeatured: is_featured !== undefined ? is_featured : false,
                    costPrice: cost_price ? parseFloat(cost_price) : null,
                    weight: weight ? parseFloat(weight) : null,
                    width: width ? parseFloat(width) : null,
                    height: height ? parseFloat(height) : null,
                    depth: depth ? parseFloat(depth) : null,
                    metaTitle: meta_title,
                    metaDescription: meta_description,
                    relatedIds: related_ids || "[]",
                    hsCode: hs_code,
                    originCountry: origin_country || "Yemen",
                    carriers: body.carriers && Array.isArray(body.carriers) ? {
                        connect: body.carriers.map((id: number) => ({ id: parseInt(id.toString()) }))
                    } : undefined
                }
            });

            // Handle Variants Creation
            if (variants && Array.isArray(variants) && variants.length > 0) {
                for (const variant of variants) {
                    const variantSku = variant.sku || `${finalSku}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

                    const newVariant = await tx.productVariant.create({
                        data: {
                            productId: product.id,
                            name: variant.name || `${name} - Variant`,
                            sku: variantSku,
                            price: parseFloat(variant.price || price), // Inherit price if missing
                            compareAtPrice: compare_at_price ? parseFloat(compare_at_price) : null,
                            stock: parseInt(variant.stock || '0'),
                            weight: variant.weight ? parseFloat(variant.weight) : null,
                            isActive: true,
                        }
                    });

                    // Handle Attributes (e.g., Size: L, Color: Red)
                    if (variant.attributes && typeof variant.attributes === 'object') {
                        for (const [attrName, __attrValue] of Object.entries(variant.attributes)) {
                            // Find or Create Attribute (e.g., "Color")
                            let attribute = await tx.attribute.findFirst({ where: { name: attrName } });
                            if (!attribute) {
                                attribute = await tx.attribute.create({ data: { name: attrName, type: 'select' } });
                            }

                            // Find or Create AttributeValue (e.g., "Red")
                            const attrValueStr = String(__attrValue);
                            let attributeValue = await tx.attributeValue.findFirst({
                                where: { attributeId: attribute.id, value: attrValueStr }
                            });
                            if (!attributeValue) {
                                attributeValue = await tx.attributeValue.create({
                                    data: { attributeId: attribute.id, name: attrValueStr, value: attrValueStr }
                                });
                            }

                            // Link to Variant
                            await tx.productVariantValue.create({
                                data: {
                                    variantId: newVariant.id,
                                    attributeValueId: attributeValue.id
                                }
                            });
                        }
                    }
                }
            }

            return product;
        });

        return NextResponse.json({
            success: true,
            productId: result.id,
            message: 'Product created successfully',
            product: result
        });

    } catch (error) {
        console.error('Product creation error:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { // Prisma unique constraint error
            return NextResponse.json({ error: 'SKU or Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product', details: errorMessage }, { status: 500 });
    }
}
