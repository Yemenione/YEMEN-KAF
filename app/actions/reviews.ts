'use server';

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getFeaturedReviews = unstable_cache(
    async (limit = 6) => {
        try {
            return await prisma.review.findMany({
                where: {
                    rating: { gte: 4 },
                    isActive: true
                },
                include: {
                    patient: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    },
                    product: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });
        } catch (error) {
            console.error("Error fetching featured reviews:", error);
            return [];
        }
    },
    ['featured-reviews'],
    { revalidate: 300, tags: ['reviews'] } // 5 minutes
);
