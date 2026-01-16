
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

async function getUserId() {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as number;
    } catch (err) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        await pool.execute(
            'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
            [userId, productId]
        );

        return NextResponse.json({ message: 'Added to wishlist' });
    } catch (error) {
        console.error('Wishlist POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        await pool.execute(
            'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        return NextResponse.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Wishlist DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            // Guest users have empty wishlist (stored in localStorage)
            return NextResponse.json({ wishlist: [] });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT p.* FROM products p 
             JOIN wishlists w ON p.id = w.product_id 
             WHERE w.user_id = ? 
             ORDER BY w.created_at DESC`,
            [userId]
        );

        return NextResponse.json({ wishlist: rows });
    } catch (error) {
        console.error('Wishlist GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
