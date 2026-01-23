'use server';

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getFeaturedCategories = unstable_cache(
    async () => {
        try {
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
                    id: 'asc'
                }
            });

            return categories;
        } catch (error) {
            console.error('Error fetching featured categories:', error);
            return [];
        }
    },
    ['featured-categories'],
    { revalidate: 3600, tags: ['categories'] }
);
