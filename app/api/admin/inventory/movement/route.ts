
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productId, quantity, reason, type } = body;
        // type: 'add' | 'remove' | 'set' (optional simplification, using quantity magnitude usually)

        if (!productId || typeof quantity !== 'number' || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get current product to calculate delta if needed
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Calculate the actual change and new total
        // If the frontend sends the *difference* (e.g., +5 or -2):
        let quantityChange = quantity;
        let newStockTotal = product.stockQuantity + quantity;

        // If 'type' is provided as 'set' (manual override to exact number):
        if (type === 'set') {
            quantityChange = quantity - product.stockQuantity;
            newStockTotal = quantity;
        }

        // Transaction: Update Product Stock AND Create Movement Log
        const result = await prisma.$transaction([
            prisma.stockMovement.create({
                data: {
                    productId,
                    quantity: quantityChange,
                    reason: reason,
                    // adminId: TODO: get from session
                }
            }),
            prisma.product.update({
                where: { id: productId },
                data: { stockQuantity: newStockTotal }
            })
        ]);

        return NextResponse.json({
            success: true,
            product: result[1], // The updated product
            movement: result[0]
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to adjust stock', details: error.message },
            { status: 500 }
        );
    }
}
