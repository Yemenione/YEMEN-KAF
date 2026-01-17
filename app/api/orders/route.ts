import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';
import { sendOrderConfirmationEmail } from '@/lib/email';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        // AUTHENTICATION CHECK - MODIFIED FOR GUEST CHECKOUT
        let userId: number | null = null;

        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                userId = payload.userId as number;
            } catch (err) {
                // Invalid token, treat as guest
                console.warn('Invalid token during checkout, proceeding as guest');
            }
        }

        // If no token, proceeding as guest (userId = null)
        // Ensure shipping address includes email/contact if guest logic needed validation
        // (Assuming frontend validation handled this)

        // userId extraction moved up

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
                    'SELECT * FROM products WHERE id = ?',
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
            if (!userId) {
                // Guests cannot use server-side cart items as fallback if not provided in request
                return NextResponse.json({ error: 'Guest checkout requires items in request' }, { status: 400 });
            }

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

        // Clear cart for logged-in users (cart_items table now exists)
        if (userId) {
            try {
                await pool.execute(
                    'DELETE FROM cart_items WHERE customer_id = ?',
                    [userId]
                );
            } catch (cartError) {
                // Log but don't fail the order if cart clearing fails
                console.warn('Failed to clear cart:', cartError);
            }
        }

        // Send order confirmation email
        try {
            // Extract shipping address from the stored JSON
            const shippingData = JSON.parse(shippingAddress);

            await sendOrderConfirmationEmail({
                orderNumber,
                customerName: `${shippingData.firstName || ''} ${shippingData.lastName || ''}`,
                customerEmail: shippingData.email || '',
                items: orderItems.map((item: any) => ({
                    title: item.product_title || 'Product',
                    quantity: item.quantity,
                    price: parseFloat(item.price) * item.quantity
                })),
                subtotal: totalAmount - shippingCost,
                shipping: shippingCost,
                total: totalAmount,
                shippingAddress: `${shippingData.address || ''}\n${shippingData.city || ''}, ${shippingData.state || ''} ${shippingData.zip || ''}\n${shippingData.country || ''}`,
                paymentMethod: paymentMethod === 'stripe' ? 'Credit Card (Stripe)' : 'Cash on Delivery'
            });
            console.log('✅ Order confirmation email sent successfully');
        } catch (emailError) {
            console.error('❌ Failed to send order confirmation email:', emailError);
            // Don't fail the order if email fails
        }

        return NextResponse.json({
            success: true,
            orderId,
            orderNumber,
            totalAmount
        });


    } catch (error) {
        console.error('Order creation error:', error);
        console.error('Error details:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            name: (error as any).name,
            code: (error as any).code,
            errno: (error as any).errno,
            sql: (error as any).sql,
            sqlMessage: (error as any).sqlMessage
        });
        return NextResponse.json({
            error: 'Failed to create order',
            details: (error as Error).message,
            sqlError: (error as any).sqlMessage || 'No SQL error message'
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query = `
            SELECT 
                o.*,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name,
                c.email as customer_email
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status && status !== 'all') {
            query += ` AND o.status = ?`;
            params.push(status);
        }

        if (search) {
            query += ` AND (o.order_number LIKE ? OR c.email LIKE ? OR c.last_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [orders]: any = await pool.execute(query, params);

        // Get total count for pagination
        const [countResult]: any = await pool.execute('SELECT COUNT(*) as total FROM orders');
        const total = countResult[0].total;

        return NextResponse.json({ orders, total });

    } catch (error) {
        console.error('Orders list fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
