import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await req.json();
        const {
            name, description, code, priority, isActive,
            startsAt, endsAt, minAmount, totalAvailable, totalPerUser,
            freeShipping, reductionPercent, reductionAmount
        } = body;

        const coupon = await prisma.cartRule.update({
            where: { id },
            data: {
                name,
                description,
                code: code.toUpperCase(),
                priority,
                isActive,
                startsAt: startsAt ? new Date(startsAt) : null,
                endsAt: endsAt ? new Date(endsAt) : null,
                minAmount: minAmount || 0,
                totalAvailable,
                totalPerUser,
                freeShipping,
                reductionPercent,
                reductionAmount
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        await prisma.cartRule.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
