import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSecretConfig } from '@/lib/config';

export async function POST(req: Request) {
    try {
        const secretKey = await getSecretConfig('resend_api_key');
        const resend = new Resend(secretKey);

        const { name, email, phone, subject, message } = await req.json();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Send email to admin
        const { data, error } = await resend.emails.send({
            from: 'Yemeni Market Contact <contact@yemeni-market.com>',
            to: ['support@yemeni-market.com'], // Your support email
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-center; }
        .content { padding: 30px; background: #f9f9f9; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #000; }
        .value { margin-top: 5px; padding: 10px; background: #fff; border-left: 3px solid #000; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">From:</div>
                <div class="value">${name}</div>
            </div>
            
            <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            
            ${phone ? `
            <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${phone}</div>
            </div>
            ` : ''}
            
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
            </div>
            
            <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Contact form email error:', error);
            return NextResponse.json(
                { error: 'Failed to send message' },
                { status: 500 }
            );
        }

        // Send confirmation email to customer
        await resend.emails.send({
            from: 'Yemeni Market <noreply@yemeni-market.com>',
            to: [email],
            subject: 'We received your message',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 30px; text-center; }
        .content { padding: 30px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Contacting Us!</h1>
        </div>
        
        <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for reaching out to Yemeni Market. We have received your message and will get back to you as soon as possible, typically within 24 hours.</p>
            
            <p><strong>Your message:</strong></p>
            <p style="padding: 15px; background: #fff; border-left: 3px solid #000;">
                ${message.replace(/\n/g, '<br>')}
            </p>
            
            <p>If you have any urgent questions, please don't hesitate to call us at <strong>+33 6 66 33 68 60</strong>.</p>
            
            <p>Best regards,<br>
            <strong>Yemeni Market Team</strong></p>
        </div>
    </div>
</body>
</html>
            `,
        });

        return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
