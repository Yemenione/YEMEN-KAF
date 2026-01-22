import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Check if subscriber already exists
        const [existing] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM newsletter_subscribers WHERE email = ?',
            [email]
        );

        if (existing && existing.length > 0) {
            return NextResponse.json({ message: 'Already subscribed' });
        }

        // Insert new subscriber
        await pool.execute(
            'INSERT INTO newsletter_subscribers (email, is_active, created_at) VALUES (?, ?, ?)',
            [email, 1, new Date()]
        );

        // Send Welcome Email
        console.log("Attempting to send welcome email to:", email);
        console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

        const emailResult = await sendWelcomeEmail(email);
        console.log("Email Result:", emailResult);

        if (!emailResult.success) {
            console.error("Email sending failed:", emailResult.error);
        }

        return NextResponse.json({ message: 'Subscribed successfully', emailSent: emailResult.success });
    } catch (error) {
        console.error('Newsletter error details:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
