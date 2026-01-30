import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { getAdminSession } from "@/lib/admin-auth";
import { hasPermission, Permission } from "@/lib/rbac";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

interface ProductRow extends RowDataPacket {
    id: number;
    price: string;
    stock_quantity: number;
    name: string;
    slug: string;
}

interface CartItemRow extends RowDataPacket {
    product_id: number;
    quantity: number;
    price: string;
    product_title?: string;
}

interface CouponRow extends RowDataPacket {
    id: number;
    code: string;
    is_active: number;
    starts_at: Date;
    ends_at: Date;
    total_available: number;
    min_amount: string;
    reduction_amount: string;
    reduction_percent: string;
}

interface OrderRow extends RowDataPacket {
    id: number;
    total: number;
}

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        // AUTHENTICATION CHECK - MODIFIED FOR GUEST CHECKOUT
        let userId: number | null = null;

        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                userId = payload.userId as number;
            } catch {
                // Invalid token, treat as guest
                console.warn('Invalid token during checkout, proceeding as guest');
            }
        }

        // If no token, proceeding as guest (userId = null)
        // Ensure shipping address includes email/contact if guest logic needed validation
        // (Assuming frontend validation handled this)

        // userId extraction moved up

        const { shippingAddress, paymentMethod, shippingMethod, items, couponCode } = await req.json();

        if (!shippingAddress) {
            return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
        }

        let orderItems: { product_id: number; quantity: number; price: number; product_title: string }[] = [];
        let totalAmount = 0;

        if (items && items.length > 0) {
            // Build order items with verified prices
            console.log('Verifying items:', items);
            for (const item of items) {
                const [rows] = await pool.execute<ProductRow[]>(
                    'SELECT * FROM products WHERE id = ?',
                    [item.id]
                );

                if (rows.length > 0) {
                    const product = rows[0];
                    const price = parseFloat(product.price);
                    orderItems.push({
                        product_id: item.id,
                        quantity: item.quantity,
                        price: price,
                        product_title: product.name // Added for email
                    });
                    totalAmount += price * item.quantity;
                } else {
                    console.warn(`Product not found: ${item.id}`);
                }
            }
        } else {
            // Fallback to server-side cart
            if (!userId) {
                return NextResponse.json({ error: 'Guest checkout requires items in request' }, { status: 400 });
            }

            const [dbCartItems] = await pool.execute<CartItemRow[]>(
                `SELECT ci.*, p.price, p.name as product_title 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.customer_id = ?`,
                [userId]
            );

            if (dbCartItems.length === 0) {
                return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
            }

            orderItems = dbCartItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                product_title: item.product_title || 'Product'
            }));

            totalAmount = orderItems.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
        }

        if (orderItems.length === 0) {
            return NextResponse.json({ error: 'No valid items in order' }, { status: 400 });
        }

        // --- COUPON VALIDATION START ---
        let discountAmount = 0;

        if (couponCode) {
            try {
                // Check if coupon exists and is active
                const [coupons] = await pool.execute<CouponRow[]>(
                    'SELECT * FROM cart_rules WHERE code = ? AND is_active = 1',
                    [couponCode]
                );

                if (coupons.length > 0) {
                    const coupon = coupons[0];
                    const now = new Date();
                    const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
                    const endsAt = coupon.ends_at ? new Date(coupon.ends_at) : null;

                    let isValid = true;
                    if (startsAt && startsAt > now) isValid = false;
                    if (endsAt && endsAt < now) isValid = false;
                    if (coupon.total_available <= 0) isValid = false;
                    if (totalAmount < parseFloat(coupon.min_amount || '0')) isValid = false;

                    if (isValid) {
                        if (parseFloat(coupon.reduction_amount) > 0) {
                            discountAmount = parseFloat(coupon.reduction_amount);
                        } else if (parseFloat(coupon.reduction_percent) > 0) {
                            discountAmount = (totalAmount * parseFloat(coupon.reduction_percent)) / 100;
                        }

                        // Cap discount
                        if (discountAmount > totalAmount) discountAmount = totalAmount;

                        // Decrement usage (simple approach, ideally transaction safe)
                        await pool.execute('UPDATE cart_rules SET total_available = total_available - 1 WHERE id = ?', [coupon.id]);
                    }
                }
            } catch (err) {
                console.error("Coupon validation error during order creation:", err);
                // Continue without discount if error
            }
        }
        // --- COUPON VALIDATION END ---

        // Calculate Shipping Cost
        const shippingCost = shippingMethod === 'express' ? 25.00 : 0.00;

        // Final Total Calculation
        totalAmount = (totalAmount - discountAmount) + shippingCost;
        if (totalAmount < 0) totalAmount = 0;

        // Generate generic Order Number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create order
        const [orderResult] = await pool.execute<ResultSetHeader>(
            `INSERT INTO orders (customer_id, order_number, total_amount, status, shipping_address, payment_method, shipping_method, shipping_cost, discount_total, created_at) 
            VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW())`,
            [userId, orderNumber, totalAmount, JSON.stringify(shippingAddress), paymentMethod || 'cash_on_delivery', shippingMethod || 'standard', shippingCost, discountAmount]
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
            // Extract shipping address (already an object from req.json())
            const shippingData = typeof shippingAddress === 'string'
                ? JSON.parse(shippingAddress)
                : shippingAddress;

            await sendOrderConfirmationEmail({
                orderNumber,
                customerName: `${shippingData.firstName || ''} ${shippingData.lastName || ''}`,
                customerEmail: shippingData.email || '',
                items: orderItems.map((item) => ({
                    title: item.product_title || 'Product',
                    quantity: item.quantity,
                    price: item.price * item.quantity
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

        const sqlError = (error && typeof error === 'object' && 'sqlMessage' in error)
            ? (error as { sqlMessage: string }).sqlMessage
            : 'No SQL error message';

        return NextResponse.json({
            error: 'Failed to create order',
            details: error instanceof Error ? error.message : 'Unknown error',
            sqlError
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // --- AUTHENTICATION & PERMISSION CHECK ---
        const admin = await getAdminSession();
        const token = (await cookies()).get('auth_token')?.value;
        let customerId: number | null = null;

        if (token && !admin) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                customerId = payload.userId as number;
            } catch {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const isAdmin = admin && hasPermission(admin.role, Permission.VIEW_ORDERS);

        if (!isAdmin && !customerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // -----------------------------------------

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

        const params: (string | number)[] = [];

        // Filter by customer if not admin
        if (!isAdmin && customerId) {
            query += ` AND o.customer_id = ?`;
            params.push(customerId);
        }

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

        const [orders] = await pool.execute<OrderRow[]>(query, params);

        // Get total count for pagination
        const [countResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM orders');
        const total = countResult[0].total;

        return NextResponse.json({ orders, total });

    } catch (error) {
        console.error('Orders list fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
