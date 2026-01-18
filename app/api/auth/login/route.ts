import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');


export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        // 1. Try finding in CUSTOMERS first
        let [rows]: any = await pool.execute(
            'SELECT * FROM customers WHERE email = ? LIMIT 1',
            [email]
        );

        let user = rows[0];
        let isAdmin = false;

        // 2. If not found in customers, try ADMINS table
        if (!user) {
            const [adminRows]: any = await pool.execute(
                'SELECT * FROM admins WHERE email = ? LIMIT 1',
                [email]
            );
            user = adminRows[0];
            if (user) {
                isAdmin = true;
            }
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Verify password
        // Note: Admin table might use snake_case for password_hash too? Schema says @map("password_hash")
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Create token with role
        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            isAdmin: isAdmin,
            role: isAdmin ? (user.role || 'ADMIN') : 'CUSTOMER'
        })
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
                firstName: isAdmin ? (user.name?.split(' ')[0] || 'Admin') : user.first_name,
                lastName: isAdmin ? (user.name?.split(' ').slice(1).join(' ') || 'User') : user.last_name,
                isAdmin,
                role: isAdmin ? (user.role || 'ADMIN') : 'CUSTOMER'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
