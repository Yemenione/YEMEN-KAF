import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search'); // Order ID or Customer Name

        const where: any = {};
        if (status && status !== 'All') {
            where.status = status;
        }

        // Search logic (optional extension)
        // if (search) { ... }

        const rmas = await prisma.rMA.findMany({
            where,
            include: {
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                order: {
                    select: { id: true, orderNumber: true, totalAmount: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(rmas);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, customerId, reason, resolution } = body;

        // Validation
        if (!orderId || !customerId || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const rma = await prisma.rMA.create({
            data: {
                orderId: parseInt(orderId),
                customerId: parseInt(customerId),
                reason,
                resolution: resolution || 'Refund',
                status: 'Pending'
            }
        });

        return NextResponse.json(rma);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "RMA already exists for this order" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
