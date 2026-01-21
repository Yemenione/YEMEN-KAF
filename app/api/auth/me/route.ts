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
        const isAdminPayload = payload.isAdmin as boolean;

        let user = null;
        let role = null;

        if (isAdminPayload) {
            // Fetch from admins table
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT id, email, name, role FROM admins WHERE id = ? LIMIT 1',
                [userId]
            );
            if (rows[0]) {
                const row = rows[0];
                user = {
                    id: row.id,
                    email: row.email,
                    firstName: row.name?.split(' ')[0] || 'Admin',
                    lastName: row.name?.split(' ').slice(1).join(' ') || 'User',
                    role: row.role || 'ADMIN',
                    isAdmin: true
                };
            }
        } else {
            // Fetch from customers table
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT id, email, first_name as firstName, last_name as lastName FROM customers WHERE id = ? LIMIT 1',
                [userId]
            );
            if (rows[0]) {
                const row = rows[0];
                user = {
                    ...row,
                    role: 'CUSTOMER',
                    isAdmin: false
                };
            }
        }

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
