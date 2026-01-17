import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
