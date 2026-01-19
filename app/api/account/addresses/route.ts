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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const data = await req.json();
        const { addressLine1, addressLine2, city, state, postalCode, country, isDefault } = data;

        if (!addressLine1 || !city || !country) {
            return NextResponse.json({ error: 'Address Line 1, city, and country are required' }, { status: 400 });
        }

        // If set as default, unset other defaults
        if (data.isDefault) {
            await pool.execute(
                'UPDATE addresses SET is_default = 0 WHERE customer_id = ?',
                [userId]
            );
        }

        // Insert new address
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [result]: any = await pool.execute(
            `INSERT INTO addresses (customer_id, address_line1, address_line2, city, state, postal_code, country, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, data.addressLine1, data.addressLine2, data.city, data.state, data.postalCode, data.country, data.isDefault ? 1 : 0]
        );

        return NextResponse.json({
            success: true,
            address: { id: result.insertId, addressLine1, addressLine2, city, state, postalCode, country, isDefault }
        });

    } catch (error) {
        console.error('Address creation error:', error);
        return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }
}
