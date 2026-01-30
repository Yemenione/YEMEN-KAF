'use server';

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getProducts = unstable_cache(
    async (limit = 20) => {
        try {
            return await prisma.product.findMany({
                where: { isActive: true },
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    brand: true,
                }
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },
    ['all-products'],
    { revalidate: 3600, tags: ['products'] }
);

export const getProductBySlug = unstable_cache(
    async (slug: string) => {
        try {
            return await prisma.product.findUnique({
                where: { slug, isActive: true },
                include: {
                    category: true,
                    variants: {
                        include: {
                            attributeValues: {
                                include: {
                                    attributeValue: {
                                        include: {
                                            attribute: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching product by slug:", error);
            return null;
        }
    },
    ['product-detail'],
    { revalidate: 3600, tags: ['products'] }
);

export const getRelatedProductsCached = unstable_cache(
    async (categoryId: number, excludeId: number) => {
        try {
            return await prisma.product.findMany({
                where: { categoryId, id: { not: excludeId }, isActive: true },
                take: 8,
                include: { category: true }
            });
        } catch (error) {
            console.error("Error fetching related products:", error);
            return [];
        }
    },
    ['related-products'],
    { revalidate: 3600, tags: ['products'] }
);

export const getCarriersCached = unstable_cache(
    async () => {
        try {
            return await prisma.carrier.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'asc' }
            });
        } catch (error) {
            console.error("Error fetching carriers:", error);
            return [];
        }
    },
    ['all-carriers'],
    { revalidate: 3600, tags: ['settings'] }
);
