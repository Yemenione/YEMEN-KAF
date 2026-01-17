import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { verifyAdmin } from '@/lib/admin-auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/admin/orders/[id]/notify-shipped
 * 
 * Send tracking email notification to customer
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

        // Fetch order details
        const [orderRows]: any = await pool.execute(
            `SELECT o.*, c.email, c.first_name, c.last_name 
             FROM orders o 
             LEFT JOIN customers c ON o.customer_id = c.id 
             WHERE o.id = ?`,
            [orderId]
        );

        if (orderRows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderRows[0];

        if (!order.tracking_number) {
            return NextResponse.json({ error: 'No tracking number available' }, { status: 400 });
        }

        if (!order.email) {
            return NextResponse.json({ error: 'No customer email available' }, { status: 400 });
        }

        // Fetch order items for email
        const [items]: any = await pool.execute(
            `SELECT product_title, quantity, price 
             FROM order_items 
             WHERE order_id = ?`,
            [orderId]
        );

        // Parse shipping address for delivery info
        let shippingAddress;
        try {
            shippingAddress = JSON.parse(order.shipping_address);
        } catch {
            shippingAddress = {};
        }

        // Calculate estimated delivery (3-5 days from now)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
        const deliveryDateStr = estimatedDelivery.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Build items list for email
        const itemsList = items.map((item: any) =>
            `• ${item.product_title} (x${item.quantity}) - €${parseFloat(item.price).toFixed(2)}`
        ).join('\n');

        // Tracking URL
        const trackingUrl = `https://www.laposte.fr/outils/suivre-vos-envois?code=${order.tracking_number}`;

        // Send email via Resend
        const emailResult = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'orders@yemeni-market.com',
            to: order.email,
            subject: `📦 Votre commande #${order.order_number} a été expédiée !`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4A3B32 0%, #6B5B4F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .tracking-box { background: white; border: 2px solid #D4A574; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #4A3B32; margin: 10px 0; letter-spacing: 2px; }
        .button { display: inline-block; background: #D4A574; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
        .items { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">📦 Votre colis est en route !</h1>
        </div>
        <div class="content">
            <p>Bonjour ${order.first_name || 'Cher client'},</p>
            
            <p>Bonne nouvelle ! Votre commande a été expédiée via <strong>Colissimo</strong>.</p>
            
            <div class="tracking-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Numéro de suivi</p>
                <div class="tracking-number">${order.tracking_number}</div>
                <a href="${trackingUrl}" class="button">Suivre mon colis</a>
            </div>
            
            <p><strong>Livraison estimée :</strong> ${deliveryDateStr}</p>
            
            <div class="items">
                <h3 style="margin-top: 0; color: #4A3B32;">Détails de la commande</h3>
                <p><strong>Commande #:</strong> ${order.order_number}</p>
                <p><strong>Articles :</strong></p>
                <pre style="font-family: Arial; font-size: 14px; margin: 10px 0;">${itemsList}</pre>
                <p style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px;">
                    <strong>Total :</strong> €${parseFloat(order.total_amount).toFixed(2)}
                </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                <strong>Adresse de livraison :</strong><br>
                ${shippingAddress.address || ''}<br>
                ${shippingAddress.zip || ''} ${shippingAddress.city || ''}<br>
                ${shippingAddress.country || ''}
            </p>
            
            <p>Merci pour votre confiance !</p>
            <p style="color: #D4A574; font-weight: bold;">L'équipe Yemeni Market</p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>Pour toute question, contactez-nous à ${process.env.SUPPORT_EMAIL || 'support@yemeni-market.com'}</p>
        </div>
    </div>
</body>
</html>
            `
        });

        return NextResponse.json({
            success: true,
            emailId: emailResult.data?.id,
            message: 'Tracking email sent successfully'
        });

    } catch (error: any) {
        console.error('Email notification error:', error);
        return NextResponse.json({
            error: 'Failed to send email',
            details: error.message
        }, { status: 500 });
    }
}
