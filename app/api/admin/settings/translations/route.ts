import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Interface removed as it was unused

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group'); // optional filtering

        const where: Prisma.TranslationWhereInput = {};
        if (group) where.group = group;

        const translations = await prisma.translation.findMany({
            where,
            orderBy: { key: 'asc' }
        });

        // Transform into a structure easier for the UI:
        // { "nav.home": { en: "Home", fr: "Accueil" }, ... }
        const result: Record<string, Record<string, string>> = {};

        translations.forEach(t => {
            if (!result[t.key]) {
                result[t.key] = { group: t.group, key: t.key };
            }
            result[t.key][t.language] = t.value;
        });

        return NextResponse.json(Object.values(result)); // Return array of row objects
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { group, key, language, value } = body;

        if (!group || !key || !language) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const translation = await prisma.translation.upsert({
            where: {
                group_key_language: {
                    group,
                    key,
                    language
                }
            },
            update: { value },
            create: {
                group,
                key,
                language,
                value
            }
        });

        return NextResponse.json(translation);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
