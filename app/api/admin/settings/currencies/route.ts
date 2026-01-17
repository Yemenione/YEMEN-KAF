import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const currencies = await prisma.currency.findMany({
            orderBy: { isDefault: 'desc' }
        });
        return NextResponse.json(currencies);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, isoCode, symbol, exchangeRate, isDefault } = body;

        // Validation
        if (!name || !isoCode || !symbol) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // If default, force rate to 1
        // Also unset other defaults
        let rate = exchangeRate;
        if (isDefault) {
            rate = 1;
            await prisma.currency.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const currency = await prisma.currency.create({
            data: {
                name,
                isoCode,
                symbol,
                exchangeRate: rate || 1,
                isDefault: isDefault || false,
                isActive: true
            }
        });

        return NextResponse.json(currency);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Currency with this ISO code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
