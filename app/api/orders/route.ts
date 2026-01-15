import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        const { shippingAddress, paymentMethod } = await req.json();

        if (!shippingAddress) {
            return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
        }

        // Get cart items
        const [cartItems]: any = await pool.execute(
            `SELECT ci.*, p.price 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.customer_id = ?`,
            [userId]
        );

        if (cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total
        const totalAmount = cartItems.reduce((sum: number, item: any) =>
            sum + (item.price * item.quantity), 0
        );

        // Create order
        const [orderResult]: any = await pool.execute(
            `INSERT INTO orders (customer_id, total_amount, status, shipping_address, payment_method, created_at) 
            VALUES (?, ?, 'pending', ?, ?, NOW())`,
            [userId, totalAmount, shippingAddress, paymentMethod || 'cash_on_delivery']
        );

        const orderId = orderResult.insertId;

        // Create order items
        for (const item of cartItems) {
            await pool.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // Clear cart
        await pool.execute(
            'DELETE FROM cart_items WHERE customer_id = ?',
            [userId]
        );

        return NextResponse.json({
            success: true,
            orderId,
            totalAmount
        });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
