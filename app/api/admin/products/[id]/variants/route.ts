import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
            stock: v.stock,
            isActive: v.isActive,
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
                .filter((v: any) => v.id)
                .map((v: any) => v.id);

            // 2. Archive (Soft Delete) variants not in the list
            await tx.productVariant.updateMany({
                where: {
                    productId,
                    id: { notIn: existingParamIds }
                },
                data: { isActive: false }
            });

            // 3. Upsert variants
            for (const v of variants) {
                if (v.id) {
                    // Update
                    await tx.productVariant.update({
                        where: { id: v.id },
                        data: {
                            name: v.name,
                            sku: v.sku,
                            price: v.price,
                            stock: v.stock,
                            isActive: v.isActive
                        }
                    });
                } else {
                    // Create
                    const newVariant = await tx.productVariant.create({
                        data: {
                            productId,
                            name: v.name,
                            sku: v.sku,
                            price: v.price,
                            stock: v.stock,
                            isActive: v.isActive
                        }
                    });

                    // Link Attributes
                    if (v.attributes && v.attributes.length > 0) {
                        await tx.productVariantValue.createMany({
                            data: v.attributes.map((attr: any) => ({
                                variantId: newVariant.id,
                                attributeValueId: attr.valueId
                            }))
                        });
                    }
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Variants updated' });

    } catch (error: any) {
        console.error("Save variants error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Duplicate SKU detected' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to save variants' }, { status: 500 });
    }
}
