import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function GET() {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        // Fetch user profile
        const [rows]: any = await pool.execute(
            'SELECT id, email, first_name as firstName, last_name as lastName, phone FROM customers WHERE id = ? LIMIT 1',
            [userId]
        );

        const user = rows[0];

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });

    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

export async function PUT(req: Request) {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        const { firstName, lastName, phone } = await req.json();

        if (!firstName || !lastName) {
            return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
        }

        // Update user profile
        await pool.execute(
            'UPDATE customers SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
            [firstName, lastName, phone || null, userId]
        );

        return NextResponse.json({
            success: true,
            user: { id: userId, firstName, lastName, phone }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
