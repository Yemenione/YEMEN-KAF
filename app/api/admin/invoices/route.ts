import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const token = (await cookies()).get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Ideally verify admin role here

        const [orders] = await pool.execute<RowDataPacket[]>(
            `SELECT o.id, o.created_at, o.total_amount, o.status, 
                    c.first_name, c.last_name, c.email
             FROM orders o
             JOIN customers c ON o.customer_id = c.id
             ORDER BY o.created_at DESC`
        );

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Failed to fetch invoices', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}
