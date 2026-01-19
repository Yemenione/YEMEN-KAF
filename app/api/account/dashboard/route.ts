import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';

import { RowDataPacket } from 'mysql2';

// Define interfaces for query results
interface RecentOrderRow extends RowDataPacket {
    id: number;
    totalAmount: string;
    status: string;
    createdAt: Date;
}

interface StatsRow extends RowDataPacket {
    totalOrders: number;
    totalSpent: string; // Decimal is returned as string
}



const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function GET() {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        // Get total orders and total spent
        const [statsRows] = await pool.execute<StatsRow[]>(
            `SELECT 
                COUNT(*) as totalOrders,
                COALESCE(SUM(total_amount), 0) as totalSpent
            FROM orders 
            WHERE customer_id = ?`,
            [userId]
        );

        // Get recent orders (last 3)
        const [recentOrders] = await pool.execute<RecentOrderRow[]>(
            `SELECT 
                o.id,
                o.total_amount as totalAmount,
                o.status,
                o.created_at as createdAt
            FROM orders o
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC
            LIMIT 3`,
            [userId]
        );

        const stats = statsRows[0];

        return NextResponse.json({
            stats: {
                totalOrders: stats.totalOrders,
                totalSpent: parseFloat(stats.totalSpent)
            },
            recentOrders: recentOrders.map(order => ({
                ...order,
                totalAmount: parseFloat(order.totalAmount)
            }))
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
