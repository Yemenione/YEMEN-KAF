'use server';

import { prisma } from "@/lib/prisma";

export async function getFeaturedReviews(limit = 6) {
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
}
