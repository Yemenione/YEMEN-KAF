import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET() {
    try {
        const { authorized, response } = await verifyAdmin();
        if (!authorized) return response;

        const carriers = await prisma.carrier.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(carriers);
    } catch (error) {
        console.error('Failed to fetch carriers:', error);
        return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 });
    }
}
