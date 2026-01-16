import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        const { orderNumber } = await params;

        // Fetch order details
        const [orders]: any = await pool.execute(
            `SELECT * FROM orders WHERE order_number = ?`,
            [orderNumber]
        );

        if (orders.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orders[0];

        // Fetch order items
        const [items]: any = await pool.execute(
            `SELECT oi.*, p.name, p.images, p.slug 
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [order.id]
        );

        // Parse shipping address if it's JSON
        let shippingAddress = order.shipping_address;
        try {
            if (typeof shippingAddress === 'string') {
                shippingAddress = JSON.parse(shippingAddress);
            }
        } catch (e) {
            console.warn('Failed to parse shipping address:', e);
        }

        return NextResponse.json({
            id: order.id,
            orderNumber: order.order_number,
            status: order.status,
            totalAmount: parseFloat(order.total_amount),
            shippingCost: parseFloat(order.shipping_cost || 0),
            shippingMethod: order.shipping_method,
            paymentMethod: order.payment_method,
            shippingAddress,
            createdAt: order.created_at,
            items: items.map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                name: item.name || item.product_title,
                slug: item.slug || item.product_slug,
                images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
                quantity: item.quantity,
                price: parseFloat(item.price)
            }))
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order details' },
            { status: 500 }
        );
    }
}
