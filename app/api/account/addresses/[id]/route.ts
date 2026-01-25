import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');


export async function PUT(
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

        const data = await req.json();
        const { street, city, state, postalCode, country, isDefault } = data;

        // Validation
        if (!street || !city || !country) {
            return NextResponse.json({ error: 'Street, city, and country are required' }, { status: 400 });
        }

        // Check ownership
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [existing]: any = await pool.execute(
            'SELECT id FROM addresses WHERE id = ? AND customer_id = ?',
            [id, userId]
        );

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // If setting as default, unset others
        if (isDefault) {
            await pool.execute(
                'UPDATE addresses SET is_default = 0 WHERE customer_id = ?',
                [userId]
            );
        }

        // Update address
        await pool.execute(
            `UPDATE addresses 
             SET street_address = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ?
             WHERE id = ? AND customer_id = ?`,
            [street, city, state, postalCode, country, isDefault ? 1 : 0, id, userId]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Address update error:', error);
        return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }
}

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
