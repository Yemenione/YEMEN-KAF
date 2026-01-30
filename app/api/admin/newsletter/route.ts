import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET(req: Request) {
    const user = await getAdminSession();

    // Basic auth check - refine based on your permission system
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    try {
        const where: any = {};
        if (search) {
            where.email = { contains: search };
        }

        const [subscribers, total] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.newsletterSubscriber.count({ where }),
        ]);

        return NextResponse.json({ subscribers, total });
    } catch (error) {
        console.error('Failed to fetch subscribers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
