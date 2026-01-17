
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const logs = await prisma.activityLog.findMany({
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
        });

        const total = await prisma.activityLog.count();

        return NextResponse.json({ logs, total });
    } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        // Fallback for prisma errors during generation
        return NextResponse.json({ logs: [], total: 0 });
    }
}
