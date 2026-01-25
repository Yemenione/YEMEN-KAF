import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { to } = await req.json();

        if (!to) {
            return NextResponse.json({ error: 'Email address required' }, { status: 400 });
        }

        await sendEmail({
            to,
            subject: 'Test Email from YEM KAF Admin',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #cfb160;">SMTP Configuration Success</h2>
                    <p>This is a test email to verify that your SMTP settings are correct.</p>
                    <p>If you are reading this, the system is working!</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Sent from Yem Kaf Admin Portal</p>
                </div>
            `
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Test email failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
