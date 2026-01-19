import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const rma = await prisma.rMA.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                },
                order: {
                    include: {
                        items: true // Show what was bought
                    }
                }
            }
        });

        if (!rma) {
            return NextResponse.json({ error: "RMA not found" }, { status: 404 });
        }

        return NextResponse.json(rma);
    } catch (error) {
        // const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
        const { status, resolution, adminNotes } = body;

        const rma = await prisma.rMA.update({
            where: { id },
            data: {
                status,
                resolution,
                adminNotes
            }
        });

        return NextResponse.json(rma);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 });
    }
}
