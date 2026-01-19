
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const { id } = await params;
        const body = await req.json();
        const { name, rate, country, priority, isActive } = body;

        const taxRule = await prisma.taxRule.update({
            where: { id: parseInt(id) },
            data: {
                name,
                rate: parseFloat(rate),
                country,
                priority: parseInt(priority || '0'),
                isActive
            }
        });

        return NextResponse.json(taxRule);
    } catch {
        return NextResponse.json({ error: 'Failed to update tax rule' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const { id } = await params;

        // Check for usage
        const usage = await prisma.product.count({
            where: { taxRuleId: parseInt(id) }
        });

        if (usage > 0) {
            return NextResponse.json({ error: `Cannot delete: Used by ${usage} products` }, { status: 400 });
        }

        await prisma.taxRule.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete tax rule' }, { status: 500 });
    }
}
