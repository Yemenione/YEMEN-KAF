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

        // Fetch user orders with items
        const [orders]: any = await pool.execute(
            `SELECT 
                o.id,
                o.total_amount as totalAmount,
                o.status,
                o.created_at as createdAt,
                o.shipping_address as shippingAddress,
                GROUP_CONCAT(
                    CONCAT(p.name, ' x', oi.quantity, ' (', oi.price, ' YER)')
                    SEPARATOR '|'
                ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.customer_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC`,
            [userId]
        );

        // Format the orders
        const formattedOrders = orders.map((order: any) => ({
            ...order,
            items: order.items ? order.items.split('|') : []
        }));

        return NextResponse.json({ orders: formattedOrders });

    } catch (error) {
        console.error('Orders fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
