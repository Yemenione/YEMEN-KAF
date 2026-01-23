
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { verifyPermission } from '@/lib/admin-auth';
import { Permission } from '@/lib/rbac';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await verifyPermission(Permission.MANAGE_ADMINS);
    if (!authorized) return response;

    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const { password, ...data } = await request.json();

        // If password is being updated, hash it
        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.admin.update({
            where: { id },
            data
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _passwordHash, ...adminWithoutPassword } = updated;
        return NextResponse.json(adminWithoutPassword);
    } catch (error) {
        console.error('Update failed:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await verifyPermission(Permission.MANAGE_ADMINS);
    if (!authorized) return response;

    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Prevent deleting the last super admin
        const adminToDelete = await prisma.admin.findUnique({ where: { id } });
        if (adminToDelete?.role === 'SUPER_ADMIN') {
            const superAdminCount = await prisma.admin.count({
                where: { role: 'SUPER_ADMIN' }
            });
            if (superAdminCount <= 1) {
                return NextResponse.json({ error: 'Cannot delete the last super admin' }, { status: 400 });
            }
        }

        await prisma.admin.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
