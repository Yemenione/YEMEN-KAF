import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
        title: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    shipping: number;
    total: number;
    shippingAddress: string;
    paymentMethod: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 30px; text-center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; background: #f9f9f9; }
        .order-info { background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .order-number { font-size: 20px; font-weight: bold; color: #000; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
        .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍯 Yemeni Market</h1>
            <p>Order Confirmation</p>
        </div>
        
        <div class="content">
            <h2>Thank you for your order, ${data.customerName}!</h2>
            <p>We've received your order and will process it shortly.</p>
            
            <div class="order-info">
                <p class="order-number">Order #${data.orderNumber}</p>
                
                <h3>Order Details</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.title}</td>
                                <td>${item.quantity}</td>
                                <td>€${item.price.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td colspan="2"><strong>Subtotal</strong></td>
                            <td>€${data.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><strong>Shipping</strong></td>
                            <td>€${data.shipping.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="2"><strong>Total</strong></td>
                            <td>€${data.total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3>Shipping Address</h3>
                <p>${data.shippingAddress.replace(/\n/g, '<br>')}</p>
                
                <h3>Payment Method</h3>
                <p>${data.paymentMethod}</p>
            </div>
            
            <center>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders" class="button">View Order Status</a>
            </center>
            
            <p>If you have any questions, please contact us at support@yemeni-market.com</p>
        </div>
        
        <div class="footer">
            <p>© 2026 Yemeni Market. All rights reserved.</p>
            <p>Authentic Yemeni Honey & Coffee</p>
        </div>
    </div>
</body>
</html>
        `;

        const { data: emailData, error } = await resend.emails.send({
            from: 'Yemeni Market <orders@yemeni-market.com>',
            to: [data.customerEmail],
            subject: `Order Confirmation #${data.orderNumber}`,
            html: emailHtml,
        });

        if (error) {
            console.error('Email sending error:', error);
            return { success: false, error };
        }

        console.log('Order confirmation email sent:', emailData);
        return { success: true, data: emailData };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}
