import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { customerId, items, shippingAddress, paymentMethod, status, discount } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items selected' }, { status: 400 });
        }

        // 1. Calculate Totals & Verify Items
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [item.id]);
            if (rows.length === 0) continue;

            const product = rows[0];
            const price = parseFloat(product.price as string); // Use database price OR allow override? 
            // For now, let's stick to DB price but manual override can be added later

            const lineTotal = price * item.quantity;
            totalAmount += lineTotal;

            orderItems.push({
                product_id: product.id,
                quantity: item.quantity,
                price: price,
                total_price: lineTotal
            });
        }

        // Apply Discount (if any)
        if (discount) {
            totalAmount -= parseFloat(discount);
        }

        // Shipping (Flat rate for manual orders or custom?)
        // Let's assume 0 for POS/Manual unless specified
        const shippingCost = 0;

        // 2. Create Order
        const orderNumber = `MAN-${Date.now()}`;

        const [orderResult] = await pool.execute<ResultSetHeader>(
            `INSERT INTO orders (
                customer_id, order_number, total_amount, status, 
                shipping_address, payment_method, shipping_method, 
                shipping_cost, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                customerId || null,
                orderNumber,
                totalAmount,
                status || 'pending',
                JSON.stringify(shippingAddress || {}),
                paymentMethod || 'manual',
                'manual_pickup',
                shippingCost
            ]
        );

        const orderId = orderResult.insertId;

        // 3. Insert Items
        for (const item of orderItems) {
            await pool.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // 4. Log Status History
        await pool.execute(
            `INSERT INTO order_status_history (order_id, status, created_at, created_by) VALUES (?, ?, NOW(), 'Admin')`,
            [orderId, status || 'pending']
        );

        return NextResponse.json({ success: true, orderId, orderNumber });

    } catch (error) {
        console.error('Manual order creation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
