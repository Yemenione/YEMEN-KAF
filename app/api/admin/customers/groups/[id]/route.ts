import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await req.json();
        const { name, discountPct, color } = body;

        const group = await prisma.customerGroup.update({
            where: { id },
            data: {
                name,
                discountPct,
                color
            }
        });

        return NextResponse.json(group);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        // Check if group is in use
        const count = await prisma.customer.count({
            where: { customerGroupId: id }
        });

        if (count > 0) {
            return NextResponse.json(
                { error: "Cannot delete group assigned to customers." },
                { status: 400 }
            );
        }

        await prisma.customerGroup.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
