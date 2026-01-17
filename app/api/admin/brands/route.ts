import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { products: true } } }
        });
        return NextResponse.json(brands);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, slug, description, logo, isActive } = body;

        const brand = await prisma.brand.create({
            data: {
                name,
                slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description,
                logo,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(brand);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Brand slug must be unique' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }
}
