import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // Open, Closed, etc.
        const search = searchParams.get('search'); // Subject or Customer Name

        const where: any = {};
        if (status && status !== 'All') {
            where.status = status; // Exact match for now
        }

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(tickets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId, subject, priority, message } = body;

        // Create Ticket
        const ticket = await prisma.ticket.create({
            data: {
                customerId: parseInt(customerId),
                subject,
                priority: priority || 'Normal',
                status: 'Open',
                messages: {
                    create: {
                        senderType: 'ADMIN',
                        senderId: 1, // TODO: Get actual admin ID from session
                        message: message
                    }
                }
            }
        });

        return NextResponse.json(ticket);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
