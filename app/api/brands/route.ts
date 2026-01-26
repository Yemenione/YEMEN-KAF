import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            where: { isActive: true },
            select: { id: true, name: true, slug: true, logo: true }
        });
        return NextResponse.json({ brands });
    } catch (error) {
        return NextResponse.json({ brands: [] }, { status: 500 });
    }
}
