import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search') || undefined;
        const categoryId = searchParams.get('category');
        const sort = searchParams.get('sort');
        const minPrice = searchParams.get('min_price');
        const maxPrice = searchParams.get('max_price');

        // Build Prisma query
        const where: Prisma.ProductWhereInput = {
            isActive: true,
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            }),
            ...(categoryId && { categoryId: parseInt(categoryId) }),
            ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
            ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
            ...(sort === 'discounted' && {
                compareAtPrice: { not: null }
            })
        };

        let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };
        else if (sort === 'featured') orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        else if (sort === 'discounted') orderBy = { createdAt: 'desc' };

        const products = await prisma.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                category: true
            }
        });

        // Normalize data structure for frontend
        const normalizedProducts = products.map((p) => {
            let imageList: string[] = [];
            try {
                imageList = p.images ? JSON.parse(p.images) : [];
            } catch {
                imageList = p.images ? [p.images] : [];
            }

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price.toString(),
                regular_price: p.compareAtPrice ? p.compareAtPrice.toString() : p.price.toString(),
                sale_price: p.price.toString(),
                description: p.description,
                images: imageList,
                category_name: p.category?.name || 'Uncategorized',
                stock_quantity: p.stockQuantity,
                in_stock: p.stockQuantity > 0
            };
        });

        return NextResponse.json({ products: normalizedProducts });

    } catch (error) {
        console.error('Products fetch error:', error);
        // Log more details if possible to understand 409 Conflict source
        console.log('Request URL:', req.url);
        return NextResponse.json({ error: 'Failed to fetch products', details: String(error) }, { status: 500 });
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
            finalSlug = `product - ${Date.now()} `;
        }

        // Generate SKU if not provided
        const finalSku = sku || `YEM - ${Math.random().toString(36).substring(2, 7).toUpperCase()} -${Date.now().toString().slice(-4)} `;

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
                    const variantSku = variant.sku || `${finalSku} -${Math.random().toString(36).substring(2, 5).toUpperCase()} `;

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
