
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { verifyPermission } from '@/lib/admin-auth';
import { Permission } from '@/lib/rbac';

export async function GET() {
    const { authorized, response } = await verifyPermission(Permission.MANAGE_ADMINS);
    if (!authorized) return response;

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

export async function POST(request: Request) {
    const { authorized, response } = await verifyPermission(Permission.MANAGE_ADMINS);
    if (!authorized) return response;

    try {
        const { email, password, name, role } = await request.json();

        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if admin already exists
        const existing = await prisma.admin.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.admin.create({
            data: {
                email,
                passwordHash,
                name,
                role
            }
        });

        const { passwordHash: _, ...adminWithoutPassword } = newAdmin;
        return NextResponse.json(adminWithoutPassword);
    } catch (error) {
        console.error('Failed to create admin:', error);
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}

// Keeping PUT here temporarily or moving to [id] later based on UI requirements
export async function PUT(request: Request) {
    const { authorized, response } = await verifyPermission(Permission.MANAGE_ADMINS);
    if (!authorized) return response;

    try {
        const { id, role, ...rest } = await request.json();
        const updated = await prisma.admin.update({
            where: { id: parseInt(id) },
            data: {
                role,
                ...rest
            }
        });
        const { passwordHash: _, ...adminWithoutPassword } = updated;
        return NextResponse.json(adminWithoutPassword);
    } catch {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
