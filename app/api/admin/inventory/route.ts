
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Fetch products with their valid stock count and basic info
        // In a real scenario, we might want pagination here
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                sku: true,
                reference: true, // Legacy reference
                stockQuantity: true,
                price: true,
                isActive: true,
                images: true,
                category: {
                    select: { name: true }
                },
                // Fetch last 5 movements for quick preview
                stockMovements: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        quantity: true,
                        reason: true,
                        createdAt: true,
                        adminId: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch inventory', details: error.message },
            { status: 500 }
        );
    }
}
