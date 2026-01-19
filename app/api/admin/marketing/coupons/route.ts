import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { Prisma } from "@prisma/client";

export async function GET() {
    try {
        const coupons = await prisma.cartRule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(coupons);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // ... (body parsing and validation)

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
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
