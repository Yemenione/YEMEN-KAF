import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const taxes = await prisma.taxRule.findMany({
            orderBy: { priority: 'desc' }
        });
        return NextResponse.json(taxes);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, rate, country, priority, isActive } = body;

        // Validation
        if (!name || rate === undefined || !country) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const tax = await prisma.taxRule.create({
            data: {
                name,
                rate: rate,
                country: country.toUpperCase(),
                priority: priority || 0,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(tax);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
