import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        // const { searchParams } = new URL(req.url);

        // Fetch from Prisma
        const categories = await prisma.category.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                displayOrder: 'asc'
            },
            take: 100 // Limit results
        });

        // Normalize data structure for frontend
        const normalizedCategories = categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            image_url: c.imageUrl,
            count: 0 // Count might be added later with aggregations if needed
        }));

        return NextResponse.json({ categories: normalizedCategories });

    } catch (error) {
        console.error('Categories fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
