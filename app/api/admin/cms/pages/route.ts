import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(pages);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, slug, content, structured_content, metaTitle, metaDescription, isActive } = body;

        // Validations
        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        // Auto-generate slug if missing
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }

        const page = await prisma.page.create({
            data: {
                title,
                slug: finalSlug,
                content: content || '',
                structured_content: structured_content || Prisma.JsonNull,
                metaTitle,
                metaDescription,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(page);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: "Page slug must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create page" }, { status: 500 });
    }
}
