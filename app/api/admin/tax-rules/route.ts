
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const taxRules = await prisma.taxRule.findMany({
            orderBy: { priority: 'desc' }
        });

        return NextResponse.json(taxRules);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tax rules' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const body = await req.json();
        const { name, rate, country, priority, isActive } = body;

        const taxRule = await prisma.taxRule.create({
            data: {
                name,
                rate: parseFloat(rate),
                country,
                priority: parseInt(priority || '0'),
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(taxRule);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tax rule' }, { status: 500 });
    }
}
