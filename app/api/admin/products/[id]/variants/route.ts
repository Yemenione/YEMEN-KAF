import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const productId = parseInt(params.id);
        const variants = await prisma.productVariant.findMany({
            where: { productId, isActive: true },
            include: {
                attributeValues: {
                    include: { attributeValue: true }
                }
            }
        });

        // Transform for frontend if needed, or send as is
        // Frontend expects: { attributes: { attributeId, valueId }[] }
        const formatted = variants.map(v => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            stock: v.stock,
            isActive: v.isActive,
            images: v.images, // Pass raw JSON string or parse if needed. Frontend currently expects string from initialData but let's see. 
            // ProductForm parses initialData.images. ProductVariantsManager will likely want specific handling.
            // Let's pass it as is (string or null).
            attributes: v.attributeValues.map(av => ({
                attributeId: av.attributeValue.attributeId,
                valueId: av.attributeValue.id
            }))
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Fetch variants error:", error);
        return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
    }
}

interface VariantBody {
    id?: number;
    name: string;
    sku: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    isActive: boolean;
    images?: string;
    attributes?: { valueId: number }[];
}

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const productId = parseInt(params.id);
        const body = await req.json();
        const { variants } = body; // Array of variants

        // Transactional update
        await prisma.$transaction(async (tx) => {
            // 1. Get existing IDs
            const existingParamIds = variants
                .filter((v: VariantBody) => v.id)
                .map((v: VariantBody) => v.id);

            // 2. Archive (Soft Delete) variants not in the list
            await tx.productVariant.updateMany({
                where: {
                    productId,
                    id: { notIn: existingParamIds as number[] }
                },
                data: { isActive: false }
            });

            // 3. Upsert variants
            for (const v of (variants as VariantBody[])) {
                const variantData = {
                    name: v.name,
                    sku: v.sku,
                    price: v.price,
                    compareAtPrice: v.compareAtPrice,
                    stock: v.stock,
                    isActive: v.isActive,
                    images: v.images // Expecting JSON string
                };

                if (v.id) {
                    // Update
                    await tx.productVariant.update({
                        where: { id: v.id },
                        data: variantData
                    });

                    // Update Attributes: Delete existing, recreate new links
                    await tx.productVariantValue.deleteMany({
                        where: { variantId: v.id }
                    });

                    if (v.attributes && v.attributes.length > 0) {
                        await tx.productVariantValue.createMany({
                            data: v.attributes.map((attr: { valueId: number }) => ({
                                variantId: v.id!,
                                attributeValueId: attr.valueId
                            }))
                        });
                    }

                } else {
                    // Create
                    const newVariant = await tx.productVariant.create({
                        data: {
                            productId,
                            ...variantData
                        }
                    });

                    // Link Attributes
                    if (v.attributes && v.attributes.length > 0) {
                        await tx.productVariantValue.createMany({
                            data: v.attributes.map((attr: { valueId: number }) => ({
                                variantId: newVariant.id,
                                attributeValueId: attr.valueId
                            }))
                        });
                    }
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Variants updated' });



        // ... (existing code)

    } catch (error) {
        console.error("Save variants error:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'Duplicate SKU detected' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to save variants' }, { status: 500 });
    }
}
