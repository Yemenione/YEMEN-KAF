import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(pages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, slug, content, metaTitle, metaDescription, isActive } = body;

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
                metaTitle,
                metaDescription,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(page);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Page slug must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
