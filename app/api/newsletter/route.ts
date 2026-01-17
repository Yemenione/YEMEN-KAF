import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Check if subscriber already exists
        const [existing]: any = await pool.execute(
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

        return NextResponse.json({ message: 'Subscribed successfully' });
    } catch (error: any) {
        console.error('Newsletter error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
