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

        const { shippingAddress, paymentMethod, shippingMethod, items } = await req.json();

        if (!shippingAddress) {
            return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
        }

        let orderItems = [];
        let totalAmount = 0;

        if (items && items.length > 0) {
            // Option 1: Handle items passed from frontend (Direct Checkout)
            // Option 1: Handle items passed from frontend (Direct Checkout)

            // Build order items with verified prices
            console.log('Verifying items:', items);
            for (const item of items) {
                const [rows]: any = await pool.execute(
                    'SELECT id, price, stock_quantity FROM products WHERE id = ?',
                    [item.id]
                );

                if (rows.length > 0) {
                    const product = rows[0];
                    const price = parseFloat(product.price);
                    orderItems.push({
                        product_id: item.id,
                        quantity: item.quantity,
                        price: price
                    });
                    totalAmount += price * item.quantity;
                } else {
                    console.warn(`Product not found: ${item.id}`);
                }
            }
        } else {
            // Option 2: Fallback to server-side cart items
            const [dbCartItems]: any = await pool.execute(
                `SELECT ci.*, p.price 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.customer_id = ?`,
                [userId]
            );

            if (dbCartItems.length === 0) {
                return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
            }

            orderItems = dbCartItems.map((item: any) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(item.price)
            }));

            totalAmount = orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        }

        if (orderItems.length === 0) {
            return NextResponse.json({ error: 'No valid items in order' }, { status: 400 });
        }

        // Calculate Shipping Cost
        const shippingCost = shippingMethod === 'express' ? 25.00 : 0.00;
        totalAmount += shippingCost;

        // Generate generic Order Number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create order
        const [orderResult]: any = await pool.execute(
            `INSERT INTO orders (customer_id, order_number, total_amount, status, shipping_address, payment_method, shipping_method, shipping_cost, created_at) 
            VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, NOW())`,
            [userId, orderNumber, totalAmount, JSON.stringify(shippingAddress), paymentMethod || 'cash_on_delivery', shippingMethod || 'standard', shippingCost]
        );

        const orderId = orderResult.insertId;

        // Create order items
        for (const item of orderItems) {
            await pool.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // Clear cart if it was used (or just clear it anyway to be safe)
        await pool.execute(
            'DELETE FROM cart_items WHERE customer_id = ?',
            [userId]
        );

        return NextResponse.json({
            success: true,
            orderId,
            orderNumber,
            totalAmount
        });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order', details: (error as Error).message }, { status: 500 });
    }
}
