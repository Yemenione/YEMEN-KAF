import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

interface OrderRow extends RowDataPacket {
    id: number;
    order_number: string;
    status: string;
    total_amount: string;
    shipping_cost: string;
    shipping_method: string;
    payment_method: string;
    created_at: Date;
    shipping_address: string; // JSON string
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
}

interface OrderItemRow extends RowDataPacket {
    id: number;
    product_id: number;
    order_id: number;
    quantity: number;
    price: string;
    name?: string;
    product_name?: string;
    slug?: string;
    product_slug?: string;
    images?: string; // JSON string or URL
    product_images?: string;
}

interface StatusHistoryRow extends RowDataPacket {
    id: number;
    order_id: number;
    status: string;
    created_at: Date;
}

// GET: Handle both Admin (ID) and Storefront (OrderNumber) lookups
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if id is numeric (ID for Admin) or string (OrderNumber for Storefront)
        // Storefront order numbers are like "ORD-123..."
        const isNumericId = /^\d+$/.test(id);

        if (isNumericId) {
            // --- ADMIN LOGIC (Fetch by ID with Customer info) ---
            const [orders] = await pool.execute<OrderRow[]>(
                `SELECT 
                    o.*,
                    c.first_name, c.last_name, c.email, c.phone
                FROM orders o
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.id = ?`,
                [id]
            );

            if (orders.length === 0) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            const order = orders[0];

            // Fetch Items with Product info
            const [items] = await pool.execute<OrderItemRow[]>(
                `SELECT 
                    oi.*,
                    p.name as product_name,
                    p.slug as product_slug,
                    p.images as product_images
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?`,
                [order.id]
            );

            // Fetch Status History
            const [history] = await pool.execute<StatusHistoryRow[]>(
                `SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC`,
                [order.id]
            );

            return NextResponse.json({ order: { ...order, items, history } });

        } else {
            // --- STOREFRONT LOGIC (Fetch by OrderNumber) ---
            const [orders] = await pool.execute<OrderRow[]>(
                `SELECT * FROM orders WHERE order_number = ?`,
                [id]
            );

            if (orders.length === 0) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            const order = orders[0];

            // Fetch Items
            const [items] = await pool.execute<OrderItemRow[]>(
                `SELECT oi.*, p.name, p.images, p.slug 
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );

            // Parse formatted response for frontend
            let shippingAddress = order.shipping_address;
            try {
                if (typeof shippingAddress === 'string') {
                    shippingAddress = JSON.parse(shippingAddress);
                }
            } catch { }

            return NextResponse.json({
                id: order.id,
                orderNumber: order.order_number,
                status: order.status,
                totalAmount: parseFloat(order.total_amount),
                shippingCost: parseFloat(order.shipping_cost || '0'),
                shippingMethod: order.shipping_method,
                paymentMethod: order.payment_method,
                shippingAddress,
                createdAt: order.created_at,
                items: items.map((item) => ({
                    id: item.id,
                    productId: item.product_id,
                    name: item.name || item.product_name, // Handle aliases
                    slug: item.slug || item.product_slug,
                    images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
                    quantity: item.quantity,
                    price: parseFloat(item.price)
                }))
            });
        }

    } catch (error) {
        console.error('Order fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
    }
}

// PATCH: Update Status (Admin only, uses ID)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, tracking_number, carrier_data } = body;

        // Assumption: Admin uses ID for updates. If id is orderNumber, we find ID first.
        let orderId = id;
        if (!/^\d+$/.test(id)) {
            const [orders] = await pool.execute<OrderRow[]>('SELECT id FROM orders WHERE order_number = ?', [id]);
            if (orders.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            orderId = orders[0].id.toString();
        }

        const updates: string[] = [];
        const values: (string | number | null)[] = [];

        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (tracking_number !== undefined) {
            updates.push('tracking_number = ?');
            values.push(tracking_number);
        }
        if (carrier_data !== undefined) {
            updates.push('carrier_data = ?');
            values.push(typeof carrier_data === 'string' ? carrier_data : JSON.stringify(carrier_data));
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(orderId);
        await pool.execute(
            `UPDATE orders SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        // Log history if status changed
        if (status) {
            await pool.execute(
                `INSERT INTO order_status_history (order_id, status, created_at, created_by) VALUES (?, ?, NOW(), 'System')`,
                [orderId, status]
            );
        }

        return NextResponse.json({ success: true, message: 'Order updated successfully' });

    } catch (error) {
        console.error('Order status update error:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
