import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        // Find user using direct SQL
        const [rows]: any = await pool.execute(
            'SELECT * FROM customers WHERE email = ? LIMIT 1',
            [email]
        );

        const user = rows[0];

        // CRITICAL: We are using a simple string comparison for now as requested/seen in initial code, 
        // but we should move to bcrypt soon.
        if (!user || user.password_hash !== password) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
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
                lastName: user.last_name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
