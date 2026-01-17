import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const coupons = await prisma.cartRule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(coupons);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            name, description, code, priority, isActive,
            startsAt, endsAt, minAmount, totalAvailable, totalPerUser,
            freeShipping, reductionPercent, reductionAmount
        } = body;

        // Validations
        if (!name || !code) {
            return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
        }

        const coupon = await prisma.cartRule.create({
            data: {
                name,
                description,
                code: code.toUpperCase(), // Store codes in uppercase
                priority: priority || 1,
                isActive: isActive !== undefined ? isActive : true,

                startsAt: startsAt ? new Date(startsAt) : null,
                endsAt: endsAt ? new Date(endsAt) : null,
                minAmount: minAmount || 0,
                totalAvailable: totalAvailable || 1000,
                totalPerUser: totalPerUser || 1,

                freeShipping: freeShipping || false,
                reductionPercent: reductionPercent || 0,
                reductionAmount: reductionAmount || 0
            }
        });

        return NextResponse.json(coupon);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
