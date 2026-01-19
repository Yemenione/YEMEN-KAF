import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);
        const page = await prisma.page.findUnique({
            where: { id }
        });

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json(page);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);
        const body = await req.json();
        const { title, slug, content, metaTitle, metaDescription, isActive } = body;

        const page = await prisma.page.update({
            where: { id },
            data: {
                title,
                slug,
                content,
                metaTitle,
                metaDescription,
                isActive
            }
        });

        return NextResponse.json(page);
    } catch (error) {
        // Prisma error code for unique constraint violation
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: "Page slug must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update page" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);
        await prisma.page.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete page" }, { status: 500 });
    }
}
