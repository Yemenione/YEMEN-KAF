'use server';

import { prisma } from '@/lib/prisma';

export async function getRamadanProducts(ids: number[]) {
    if (!ids || ids.length === 0) return [];

    try {
        const products = await prisma.product.findMany({
            where: {
                id: { in: ids },
                isActive: true
            },
            include: {
                category: true
            }
        });

        // Normalize similarly to API to ensure consistent structure if needed, 
        // but for now returning Prisma objects is fine for Server Actions 
        // as long as they are serializable (Dates need care, Decimal needs care).
        // Prisma Decimals are objects, need explicit conversion usually or use simple objects.

        return products.map(p => ({
            ...p,
            price: p.price.toString(),
            compareAtPrice: p.compareAtPrice?.toString() || null,
            costPrice: p.costPrice?.toString() || null,
            weight: p.weight?.toString() || null,
            width: p.width?.toString() || null,
            height: p.height?.toString() || null,
            depth: p.depth?.toString() || null,
            ecotax: p.ecotax?.toString() || null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            // Images parsing if needed
            images: p.images ? (JSON.parse(p.images) as string[]) : []
        }));

    } catch (error) {
        console.error('Failed to fetch Ramadan products:', error);
        return [];
    }
}
