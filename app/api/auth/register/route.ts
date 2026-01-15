import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists
        const [existingRows]: any = await pool.execute(
            'SELECT id FROM customers WHERE email = ? LIMIT 1',
            [email]
        );

        if (existingRows.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Split name into first and last
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user using direct SQL
        const [result]: any = await pool.execute(
            'INSERT INTO customers (first_name, last_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, NOW())',
            [firstName, lastName, email, hashedPassword]
        );

        const userId = result.insertId;

        // Create token
        const token = await new SignJWT({ userId, email })
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
                id: userId,
                email: email,
                firstName,
                lastName
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
