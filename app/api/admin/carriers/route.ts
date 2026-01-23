import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const carriers = await prisma.carrier.findMany({
            orderBy: { id: 'asc' },
            include: { rates: true }
        });
        return NextResponse.json(carriers);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        // Check if updating existing or creating new
        if (data.id) {
            const carrier = await prisma.carrier.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    logo: data.logo,
                    deliveryTime: data.deliveryTime,
                    description: data.description,
                    isActive: data.isActive,
                    isFree: data.isFree,
                    maxWeight: parseInt(data.maxWeight || 30000),
                }
            });
            return NextResponse.json(carrier);
        } else {
            const carrier = await prisma.carrier.create({
                data: {
                    name: data.name,
                    code: data.name.toLowerCase().replace(/\s+/g, '_'),
                    logo: data.logo,
                    deliveryTime: data.deliveryTime,
                    description: data.description,
                    isActive: data.isActive || true,
                    type: 'home' // default
                }
            });
            return NextResponse.json(carrier);
        }
    } catch (error) {
        console.error('Carrier save error:', error);
        return NextResponse.json({ error: 'Failed to save carrier' }, { status: 500 });
    }
}
