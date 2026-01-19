import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';
import { verifyAdmin } from '@/lib/admin-auth';
import { generateLabel, calculateTotalWeight } from '@/lib/shipping/colissimo';

/**
 * POST /api/admin/orders/[id]/generate-label
 * 
 * Generate Colissimo shipping label for an order
 * Admin-only endpoint
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify admin authentication
        const { authorized, response: authResponse } = await verifyAdmin();
        if (!authorized) return authResponse;

        const { id } = await params;
        const orderId = parseInt(id);

        // Fetch order details with items
        const [orderRows] = await pool.execute<RowDataPacket[]>(
            `SELECT o.*, c.email as customer_email, c.first_name, c.last_name 
             FROM orders o 
             LEFT JOIN customers c ON o.customer_id = c.id 
             WHERE o.id = ?`,
            [orderId]
        );

        if (orderRows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderRows[0];

        // Check if label already generated
        if (order.tracking_number) {
            return NextResponse.json({
                error: 'Label already generated for this order',
                trackingNumber: order.tracking_number
            }, { status: 400 });
        }

        // Fetch order items with product details
        const [items] = await pool.execute<RowDataPacket[]>(
            `SELECT oi.*, p.weight, p.hs_code, p.origin_country 
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        if (items.length === 0) {
            return NextResponse.json({ error: 'No items found in order' }, { status: 400 });
        }

        // Calculate total weight
        const itemsWithWeight = items.map((item) => ({
            weight: item.weight ? parseFloat(item.weight) : 0.5,
            quantity: item.quantity as number
        }));
        const totalWeight = calculateTotalWeight(itemsWithWeight);

        // Parse shipping address
        let shippingAddress;
        try {
            shippingAddress = JSON.parse(order.shipping_address);
        } catch {
            return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 });
        }

        // Generate label via Colissimo
        const labelResult = await generateLabel({
            orderNumber: order.order_number,
            orderValue: parseFloat(order.total_amount),
            weight: totalWeight,
            destination: {
                country: shippingAddress.country || 'FR',
                postalCode: shippingAddress.zip || shippingAddress.postalCode || '',
                city: shippingAddress.city || '',
                address: shippingAddress.address || shippingAddress.streetAddress || '',
                name: `${shippingAddress.first_name || order.first_name || ''} ${shippingAddress.last_name || order.last_name || ''}`.trim() || 'Customer',
                email: order.customer_email,
                phone: shippingAddress.phone
            },
            insuranceValue: parseFloat(order.total_amount) > 100 ? parseFloat(order.total_amount) : undefined
        });

        // Update order with tracking number and carrier data
        await pool.execute(
            `UPDATE orders 
             SET tracking_number = ?, carrier_data = ?, status = ?, updated_at = NOW()
             WHERE id = ?`,
            [
                labelResult.trackingNumber,
                JSON.stringify(labelResult.carrierData),
                order.status === 'processing' ? 'shipped' : order.status,
                orderId
            ]
        );

        // Add status history entry
        await pool.execute(
            `INSERT INTO order_status_history (order_id, status, note, created_by, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [
                orderId,
                'shipped',
                `Label generated. Tracking: ${labelResult.trackingNumber}`,
                'Admin'
            ]
        );

        return NextResponse.json({
            success: true,
            trackingNumber: labelResult.trackingNumber,
            labelUrl: labelResult.labelUrl,
            customsFormUrl: labelResult.customsFormUrl,
            carrierData: labelResult.carrierData
        });

    } catch (error) {
        console.error('Label generation error:', error);
        return NextResponse.json({
            error: 'Failed to generate label',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
