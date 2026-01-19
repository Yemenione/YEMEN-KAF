import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await req.json();
        const { name, isoCode, locale, flag, isRTL, isDefault, isActive } = body;

        // If setting as default, unset others first
        if (isDefault) {
            await prisma.language.updateMany({
                where: { id: { not: id }, isDefault: true },
                data: { isDefault: false }
            });
        }

        const language = await prisma.language.update({
            where: { id },
            data: {
                name,
                isoCode,
                locale,
                flag,
                isRTL,
                isDefault,
                isActive
            }
        });

        return NextResponse.json(language);
        return NextResponse.json(language);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // Prevent deleting the default language
        const language = await prisma.language.findUnique({ where: { id } });
        if (language?.isDefault) {
            return NextResponse.json({ error: "Cannot delete the default language" }, { status: 400 });
        }

        await prisma.language.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
