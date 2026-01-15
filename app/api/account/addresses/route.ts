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

        // Fetch user addresses
        const [addresses]: any = await pool.execute(
            'SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
            [userId]
        );

        return NextResponse.json({ addresses });

    } catch (error) {
        console.error('Addresses fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        const { street, city, state, postalCode, country, isDefault } = await req.json();

        if (!street || !city || !country) {
            return NextResponse.json({ error: 'Street, city, and country are required' }, { status: 400 });
        }

        // If this is default, unset other defaults
        if (isDefault) {
            await pool.execute(
                'UPDATE addresses SET is_default = 0 WHERE customer_id = ?',
                [userId]
            );
        }

        // Create new address
        const [result]: any = await pool.execute(
            'INSERT INTO addresses (customer_id, street, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, street, city, state || null, postalCode || null, country, isDefault ? 1 : 0]
        );

        return NextResponse.json({
            success: true,
            address: { id: result.insertId, street, city, state, postalCode, country, isDefault }
        });

    } catch (error) {
        console.error('Address creation error:', error);
        return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }
}
