import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyPermission } from '@/lib/admin-auth';
import { Permission } from '@/lib/rbac';

export async function GET() {
    try {
        const { authorized, response } = await verifyPermission(Permission.MANAGE_BRANDS);
        if (!authorized) return response;
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { products: true } } }
        });
        return NextResponse.json(brands);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, response } = await verifyPermission(Permission.MANAGE_BRANDS);
        if (!authorized) return response;

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
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'Brand slug must be unique' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }
}
