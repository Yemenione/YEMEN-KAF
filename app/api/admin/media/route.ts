import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const where: Prisma.MediaWhereInput = {};
        if (search) {
            where.OR = [
                { originalName: { contains: search } },
                { altText: { contains: search } }
            ];
        }

        const [total, files] = await prisma.$transaction([
            prisma.media.count({ where }),
            prisma.media.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return NextResponse.json({
            data: files,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch media', details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
