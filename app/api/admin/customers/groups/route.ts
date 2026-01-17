import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const groups = await prisma.customerGroup.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { customers: true }
                }
            }
        });
        return NextResponse.json(groups);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, discountPct, color } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const group = await prisma.customerGroup.create({
            data: {
                name,
                discountPct: discountPct || 0,
                color: color || '#000000'
            }
        });

        return NextResponse.json(group);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Group name already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
