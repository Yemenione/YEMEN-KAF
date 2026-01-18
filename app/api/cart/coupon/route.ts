import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { code, cartTotal } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code required' }, { status: 400 });
        }

        const coupon = await prisma.cartRule.findUnique({
            where: { code: code }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: 'Coupon is inactive' }, { status: 400 });
        }

        const now = new Date();
        if ((coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)) {
            return NextResponse.json({ error: 'Coupon is expired' }, { status: 400 });
        }

        if (coupon.totalAvailable <= 0) {
            return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }

        if (cartTotal < Number(coupon.minAmount)) {
            return NextResponse.json({
                error: `Minimum order amount of ${Number(coupon.minAmount).toFixed(2)}€ required`
            }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (Number(coupon.reductionAmount) > 0) {
            discountAmount = Number(coupon.reductionAmount);
        } else if (Number(coupon.reductionPercent) > 0) {
            discountAmount = (cartTotal * Number(coupon.reductionPercent)) / 100;
        }

        // Cap discount at cart total (no negative total)
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        return NextResponse.json({
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                name: coupon.name,
                reductionAmount: Number(coupon.reductionAmount),
                reductionPercent: Number(coupon.reductionPercent),
                freeShipping: coupon.freeShipping
            },
            discountAmount
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}
