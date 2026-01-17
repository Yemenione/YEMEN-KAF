import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const brand = await prisma.brand.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        return NextResponse.json(brand);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const body = await req.json();
        const { name, slug, description, logo, isActive } = body;

        const brand = await prisma.brand.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                logo,
                isActive
            }
        });

        return NextResponse.json(brand);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        // Optional: Check or unlink products?
        await prisma.product.updateMany({
            where: { brandId: id },
            data: { brandId: null }
        });

        await prisma.brand.delete({ where: { id } });
        return NextResponse.json({ success: true, message: 'Brand deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
    }
}
