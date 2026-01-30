'use server';

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getFeaturedCategories = unstable_cache(
    async () => {
        try {
            // 1. Try to get the manually configured categories from settings
            const config = await prisma.storeConfig.findUnique({
                where: { key: 'homepage_promo_category_ids' }
            });

            if (config && config.value) {
                try {
                    const ids = JSON.parse(config.value);
                    if (Array.isArray(ids) && ids.length > 0) {
                        const categories = await prisma.category.findMany({
                            where: {
                                id: { in: ids },
                                isActive: true
                            },
                            include: {
                                _count: {
                                    select: { products: true }
                                }
                            }
                        });

                        // Sort by the order of IDs in the config
                        return categories.sort((a, b) => {
                            return ids.indexOf(a.id) - ids.indexOf(b.id);
                        });
                    }
                } catch (e) {
                    console.error("Failed to parse homepage_promo_category_ids", e);
                }
            }

            // 2. Fallback: Get most recent/active
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
