
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                lastLogin: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(admins);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, role } = await request.json();
        const updated = await prisma.admin.update({
            where: { id: parseInt(id) },
            data: { role }
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
