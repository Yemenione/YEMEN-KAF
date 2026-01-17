import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const search = searchParams.get('search');

        let query = `
            SELECT 
                customers.id, customers.first_name, customers.last_name, customers.email, customers.phone, customers.created_at,
                (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) as order_count,
                cg.name as group_name, cg.color as group_color
            FROM customers
            LEFT JOIN customer_groups cg ON customers.customer_group_id = cg.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (search) {
            query += ` AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [customers]: any = await pool.execute(query, params);

        return NextResponse.json({ customers });

    } catch (error) {
        console.error('Customers fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}
