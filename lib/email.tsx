import { Resend } from 'resend';
import { WelcomeTemplate, OrderConfirmationTemplate, ContactEmailTemplate } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    react: any;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Email not sent.');
        return { success: false, error: 'API key missing' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Yemeni Market <onboarding@resend.dev>',
            to,
            subject,
            react,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}

export async function sendWelcomeEmail(email: string) {
    return sendEmail({
        to: email,
        subject: 'Bienvenue chez Yemeni Market - Welcome to Yemeni Market',
        react: WelcomeTemplate(),
    });
}

interface OrderItem {
    title: string;
    quantity: number;
    price: number;
}

interface OrderConfirmationParams {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    total: number;
    shippingAddress: string;
    subtotal: number;
    shipping: number;
    paymentMethod: string;
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
    return sendEmail({
        to: params.customerEmail,
        subject: `Confirmation de commande #${params.orderNumber} - Yemeni Market`,
        react: OrderConfirmationTemplate({
            orderNumber: params.orderNumber,
            customerName: params.customerName,
            items: params.items,
            total: params.total,
            shippingAddress: params.shippingAddress
        }),
    });
}

interface ContactEmailParams {
    name: string;
    email: string;
    message: string;
    phone?: string;
    subject: string;
}

export async function sendContactEmail(params: ContactEmailParams) {
    // 1. Email to Admin
    await sendEmail({
        to: 'support@yemeni-market.com',
        subject: `New Contact: ${params.subject}`,
        react: ContactEmailTemplate(params)
    });

    // 2. Confirmation to User
    return sendEmail({
        to: params.email,
        subject: 'Nous avons bien reçu votre message - Yemeni Market',
        react: ContactEmailTemplate(params)
    });
}
