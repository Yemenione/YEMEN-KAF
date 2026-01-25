import nodemailer from 'nodemailer';
import pool from './mysql';
import { RowDataPacket } from 'mysql2';

interface StoreConfigRow extends RowDataPacket {
    key: string;
    value: string;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    // 1. Fetch SMTP Config from DB
    const [rows] = await pool.execute<StoreConfigRow[]>(
        "SELECT `key`, `value` FROM store_config WHERE `key` LIKE 'smtp_%'"
    );

    const config: Record<string, string> = {};
    rows.forEach((row) => { config[row.key] = row.value; });

    if (!config.smtp_host || !config.smtp_user) {
        throw new Error("SMTP settings not configured.");
    }

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: config.smtp_host,
        port: parseInt(config.smtp_port || '587'),
        secure: config.smtp_port === '465', // true for 465, false for 587
        auth: {
            user: config.smtp_user,
            pass: config.smtp_password,
        },
    });

    // 3. Send Email
    const info = await transporter.sendMail({
        from: `"${config.smtp_from_name || 'Yem Kaf'}" <${config.smtp_from_email || config.smtp_user}>`,
        to,
        subject,
        html,
    });

    return info;
}

// 4. Send Order Confirmation
interface OrderConfirmationDetails {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: { title: string; quantity: number; price: number }[];
    subtotal: number;
    shipping: number;
    total: number;
    shippingAddress: string;
    paymentMethod: string;
}

export async function sendOrderConfirmationEmail(details: OrderConfirmationDetails) {
    const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #0f1115; padding: 20px; text-align: center;">
            <h1 style="color: #cfb160; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmation</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Dear <strong>${details.customerName}</strong>,</p>
            <p>Thank you for shopping with YEM KAF. Your order has been received and is being processed.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; margin: 25px 0; border-radius: 5px;">
                <p style="margin: 0 0 5px;"><strong>Order Number:</strong> ${details.orderNumber}</p>
                <p style="margin: 0 0 5px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p style="margin: 0;"><strong>Payment Method:</strong> ${details.paymentMethod}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <thead>
                    <tr style="border-bottom: 2px solid #eee;">
                        <th style="text-align: left; padding: 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Product</th>
                        <th style="text-align: center; padding: 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Qty</th>
                        <th style="text-align: right; padding: 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.items.map(item => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 15px 0;">${item.title}</td>
                            <td style="text-align: center; padding: 15px 0;">${item.quantity}</td>
                            <td style="text-align: right; padding: 15px 0;">${item.price.toFixed(2)}€</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 10px 0; text-align: right; color: #666;">Subtotal</td>
                        <td style="padding: 10px 0; text-align: right;">${details.subtotal.toFixed(2)}€</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 10px 0; text-align: right; color: #666;">Shipping</td>
                        <td style="padding: 10px 0; text-align: right;">${details.shipping.toFixed(2)}€</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #cfb160;">Total</td>
                        <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #cfb160;">${details.total.toFixed(2)}€</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 30px;">
                <h3 style="font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">Shipping Address</h3>
                <p style="white-space: pre-line; color: #555;">${details.shippingAddress}</p>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
                <p>If you have any questions, reply to this email or contact us at support@yemenimarket.com</p>
                <p>&copy; ${new Date().getFullYear()} YEM KAF. All rights reserved.</p>
            </div>
        </div>
    </div>
    `;

    return sendEmail({
        to: details.customerEmail,
        subject: `Order Confirmation #${details.orderNumber}`,
        html
    });
}

// 5. Send Contact Form Email
interface ContactEmailDetails {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export async function sendContactEmail(details: ContactEmailDetails) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #cfb160;">New Contact Message</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${details.name}</p>
            <p><strong>Email:</strong> ${details.email}</p>
            ${details.phone ? `<p><strong>Phone:</strong> ${details.phone}</p>` : ''}
            <p><strong>Subject:</strong> ${details.subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="white-space: pre-wrap;">${details.message}</p>
        </div>
    </div>
    `;

    try {
        // Send to admin
        await sendEmail({
            to: process.env.ADMIN_EMAIL || 'support@yemenimarket.com', // Fallback or env var
            subject: `[Contact Form] ${details.subject}`,
            html
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send contact email:", error);
        return { success: false, error };
    }
}
