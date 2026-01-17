import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ticketId = parseInt(params.id);
        const body = await req.json();
        const { message, isInternal } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Create Message
        const tempAdminId = 1; // TODO: Replace with actual session user

        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticketId,
                senderType: 'ADMIN',
                senderId: tempAdminId,
                message,
                isInternal: isInternal || false
            }
        });

        // Optionally update ticket status if admin replies
        // e.g., set to "Answered" or keep "Open"
        await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                updatedAt: new Date(),
                // If it's not internal, we might want to ensure it's Open/In Progress
                status: isInternal ? undefined : 'Open'
            }
        });

        return NextResponse.json(newMessage);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
