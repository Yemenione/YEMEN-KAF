import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                addresses: true,
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await req.json();
        const { firstName, lastName, phone } = body;

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                firstName,
                lastName,
                phone
            }
        });

        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update customer" }, { status: 500 });
    }
}
