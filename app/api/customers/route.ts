import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { verifyPermission } from "@/lib/admin-auth";
import { Permission } from "@/lib/rbac";
import { RowDataPacket } from 'mysql2';

interface CustomerRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: Date;
    order_count: number;
    group_name: string | null;
    group_color: string | null;
}

export async function GET(req: Request) {
    try {
        const { authorized, response } = await verifyPermission(Permission.VIEW_CUSTOMERS);
        if (!authorized) return response;

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

        const params: (string | number)[] = [];

        if (search) {
            query += ` AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [customers] = await pool.execute<CustomerRow[]>(query, params);

        return NextResponse.json({ customers });

    } catch (error) {
        console.error('Customers fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}
