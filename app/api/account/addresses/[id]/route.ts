import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        // Delete address (only if it belongs to the user)
        await pool.execute(
            'DELETE FROM addresses WHERE id = ? AND customer_id = ?',
            [id, userId]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Address deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }
}
