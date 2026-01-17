import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                customerGroup: true,
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await req.json();
        const { firstName, lastName, phone, customerGroupId } = body;

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                firstName,
                lastName,
                phone,
                customerGroupId: customerGroupId ? parseInt(customerGroupId) : null
            }
        });

        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
