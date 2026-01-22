import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { name, email, phone, subject, message } = await req.json();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const emailResult = await sendContactEmail({
            name,
            email,
            phone,
            subject,
            message
        });

        if (!emailResult.success) {
            console.error('Contact form email failed:', emailResult.error);
            return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
