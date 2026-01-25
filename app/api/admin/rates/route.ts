import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all rates
export async function GET() {
    try {
        const rates = await prisma.shippingRate.findMany({
            include: {
                carrier: true,
                zone: true
            },
            orderBy: [
                { carrierId: 'asc' },
                { maxWeight: 'asc' }
            ]
        });
        return NextResponse.json({ success: true, rates });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

// POST: Update a rate price
export async function POST(req: Request) {
    try {
        const { id, price } = await req.json();

        const updated = await prisma.shippingRate.update({
            where: { id: Number(id) },
            data: { price: Number(price) }
        });

        return NextResponse.json({ success: true, rate: updated });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
