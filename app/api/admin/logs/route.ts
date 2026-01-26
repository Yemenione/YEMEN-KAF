
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const search = searchParams.get('search') || '';
        const action = searchParams.get('action') || '';

        const where: Record<string, unknown> = {};

        if (action) {
            where.action = action;
        }

        if (search) {
            where.OR = [
                { action: { contains: search } },
                { entityType: { contains: search } },
                { entityId: { contains: search } },
                {
                    admin: {
                        name: { contains: search }
                    }
                }
            ];
        }

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.activityLog.count({ where })
        ]);

        return NextResponse.json({ logs, total });
    } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        return NextResponse.json({ logs: [], total: 0 });
    }
}
