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
        const { name, isoCode, symbol, exchangeRate, isDefault, isActive } = body;

        // If default, force rate to 1 and unset others
        let rate = exchangeRate;
        if (isDefault) {
            rate = 1;
            await prisma.currency.updateMany({
                where: { id: { not: id }, isDefault: true },
                data: { isDefault: false }
            });
        }

        const currency = await prisma.currency.update({
            where: { id },
            data: {
                name,
                isoCode,
                symbol,
                exchangeRate: rate,
                isDefault,
                isActive
            }
        });

        return NextResponse.json(currency);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        const currency = await prisma.currency.findUnique({ where: { id } });
        if (currency?.isDefault) {
            return NextResponse.json({ error: "Cannot delete the default currency" }, { status: 400 });
        }

        await prisma.currency.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
