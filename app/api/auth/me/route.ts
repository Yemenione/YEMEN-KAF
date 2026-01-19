import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';

import { RowDataPacket } from 'mysql2';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

interface UserRow extends RowDataPacket {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

export async function GET() {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        // Fetch user using direct SQL
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, email, first_name as firstName, last_name as lastName FROM customers WHERE id = ? LIMIT 1',
            [userId]
        );

        const user = rows[0];

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });

    } catch (error: unknown) {
        console.error("Auth error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Authentication failed', details: errorMessage }, { status: 500 });
    }
}
