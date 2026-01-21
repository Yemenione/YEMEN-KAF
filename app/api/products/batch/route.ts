import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slugsParam = searchParams.get('slugs');

        if (!slugsParam) {
            return NextResponse.json({ products: [] });
        }

        const slugs = slugsParam.split(',');

        const products = await prisma.product.findMany({
            where: {
                slug: { in: slugs },
                isActive: true
            },
            include: {
                category: true
            }
        });

        // Reorder products according to the order of slugs in the request (preserve recency)
        const slugMap = new Map(products.map(p => [p.slug, p]));
        const orderedProducts = slugs
            .map(slug => slugMap.get(slug))
            .filter((p): p is typeof products[0] => p !== undefined);

        const normalizedProducts = orderedProducts.map((p) => {
            let imageList: string[] = [];
            try {
                imageList = p.images ? JSON.parse(p.images) : [];
            } catch {
                imageList = p.images ? [p.images] : [];
            }

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price.toString(),
                description: p.description,
                images: imageList,
                category_name: p.category?.name || 'Uncategorized'
            };
        });

        return NextResponse.json({ products: normalizedProducts });
    } catch (error) {
        console.error('Batch products fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
