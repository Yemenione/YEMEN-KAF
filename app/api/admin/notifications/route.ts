import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch notification history
export async function GET() {
    try {
        // Use raw SQL because prisma generate might be blocked
        const notifications = await prisma.$queryRawUnsafe(
            `SELECT id, title, body, image_url as imageUrl, target, sent_at as sentAt 
             FROM notifications 
             ORDER BY sent_at DESC LIMIT 50`
        );
        return NextResponse.json({ success: true, notifications });
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: "Send" a notification (Mocking FCM and saving to history)
export async function POST(req: Request) {
    try {
        const { title, body, imageUrl, target } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        // 1. Save to DB history
        await prisma.$executeRawUnsafe(
            `INSERT INTO notifications (title, body, image_url, target, sent_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            title, body, imageUrl || null, target || null
        );

        // 2. Mock FCM Logic (Log it)
        console.log('📣 SENDING PUSH NOTIFICATION:', { title, body, imageUrl, target });

        // TODO: In Phase 3, implement real firebase-admin logic here
        // const response = await admin.messaging().sendToTopic('all', { notification: { title, body } });

        return NextResponse.json({
            success: true,
            message: 'Notification sent and saved to history. (FCM Mocked)'
        });
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
