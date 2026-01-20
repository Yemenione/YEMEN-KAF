'use server';

import { prisma } from "@/lib/prisma";

export async function getFeaturedCategories() {
    try {
        // Fetch categories with at least one product or specific IDs if we had a config
        // For now, we'll fetch the first 3 active categories to replace the hardcoded ones
        const categories = await prisma.category.findMany({
            where: {
                isActive: true,
            },
            take: 3,
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: {
                id: 'asc' // or displayOrder
            }
        });

        return categories;
    } catch (error) {
        console.error('Error fetching featured categories:', error);
        return [];
    }
}
