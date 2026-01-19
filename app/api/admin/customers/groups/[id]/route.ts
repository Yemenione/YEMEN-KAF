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
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

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
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
