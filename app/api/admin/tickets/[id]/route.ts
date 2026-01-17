import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' }
                },
                order: {
                    select: { id: true, orderNumber: true, totalAmount: true }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        return NextResponse.json(ticket);
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
        const { status, priority } = body;

        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                status,
                priority
            }
        });

        return NextResponse.json(ticket);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
