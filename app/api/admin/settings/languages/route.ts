import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const languages = await prisma.language.findMany({
            orderBy: { isDefault: 'desc' } // Default language first
        });
        return NextResponse.json(languages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, isoCode, locale, flag, isRTL, isDefault } = body;

        // Validation
        if (!name || !isoCode || !locale) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Handle Default Logic: If new one is default, unset others
        if (isDefault) {
            await prisma.language.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const language = await prisma.language.create({
            data: {
                name,
                isoCode,
                locale,
                flag,
                isRTL: isRTL || false,
                isDefault: isDefault || false,
                isActive: true
            }
        });

        return NextResponse.json(language);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Language with this ISO code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
