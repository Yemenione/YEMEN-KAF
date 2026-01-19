import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

interface UserRow extends RowDataPacket {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role?: string;
}

export async function POST(req: Request) {
    try {
        const { email, firstName, lastName, photoUrl } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        // Check if user exists
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT * FROM customers WHERE email = ? LIMIT 1',
            [email]
        );

        let user = rows[0];

        if (!user) {
            // Create new user
            // Generate a random password hash since they assume Google Auth
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(randomPassword, 10);

            const [result] = await pool.execute<ResultSetHeader>(
                'INSERT INTO customers (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)',
                [firstName || 'Admin', lastName || 'User', email, passwordHash]
            );

            user = {
                id: result.insertId,
                email,
                first_name: firstName || 'Admin',
                last_name: lastName || 'User'
            } as UserRow; // Cast locally created object to UserRow for consistency
        }

        // Create token
        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        // Set cookie
        (await cookies()).set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                photoUrl: photoUrl // Optional: Return photo if we want to use it in UI context
            }
        });

    } catch (error) {
        console.error('Google Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
