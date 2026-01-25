import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

interface CartItemRow extends RowDataPacket {
    id: number;
    quantity: number;
    product_id: number;
    name: string;
    price: string;
    slug: string;
    image_url: string;
}

interface ExistingItemRow extends RowDataPacket {
    id: number;
    quantity: number;
}

export async function GET() {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        // Fetch cart items with product details
        const [cartItems] = await pool.execute<CartItemRow[]>(
            `SELECT 
                ci.id,
                ci.quantity,
                p.id as product_id,
                p.name,
                p.price,
                p.slug,
                p.image_url
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.customer_id = ?`,
            [userId]
        );

        return NextResponse.json({ cartItems });

    } catch (error) {
        console.error('Cart fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
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

        const body = await req.json();

        // Check if it's a batch sync (array of items)
        if (body.items && Array.isArray(body.items)) {
            // Simple approach: Clear and re-populate, or merge
            // For robustness, let's clear current cart and replace with synced one
            // (Standard behavior for many e-commerce syncs)
            await pool.execute('DELETE FROM cart_items WHERE customer_id = ?', [userId]);

            for (const item of body.items) {
                await pool.execute(
                    'INSERT INTO cart_items (customer_id, product_id, quantity) VALUES (?, ?, ?)',
                    [userId, item.id || item.productId, item.quantity]
                );
            }
            return NextResponse.json({ success: true, message: 'Cart synced' });
        }

        // Single item addition logic (existing)
        const { productId, quantity } = body;

        if (!productId || !quantity) {
            return NextResponse.json({ error: 'Product ID and quantity required' }, { status: 400 });
        }

        const [existing] = await pool.execute<ExistingItemRow[]>(
            'SELECT id, quantity FROM cart_items WHERE customer_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            await pool.execute<ResultSetHeader>(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity, existing[0].id]
            );
        } else {
            await pool.execute<ResultSetHeader>(
                'INSERT INTO cart_items (customer_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Cart add error:', error);
        return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('id');

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
        }

        await pool.execute<ResultSetHeader>(
            'DELETE FROM cart_items WHERE id = ? AND customer_id = ?',
            [itemId, userId]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Cart delete error:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
