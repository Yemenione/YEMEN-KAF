import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existing) {
            if (!existing.isActive) {
                // Reactivate
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: { isActive: true },
                });
                // Send welcome email again on reactivation? Maybe.
                await sendWelcomeEmail(email);
                return NextResponse.json({ success: true, message: 'Subscribed successfully' });
            }
            return NextResponse.json({ message: 'Already subscribed' });
        }

        // Create new
        await prisma.newsletterSubscriber.create({
            data: { email },
        });

        // Send Welcome Email
        const emailResult = await sendWelcomeEmail(email);

        if (!emailResult.success) {
            console.error("Welcome email failed:", emailResult.error);
        }

        return NextResponse.json({ success: true, message: 'Subscribed successfully', emailSent: emailResult.success });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
