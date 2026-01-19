import { NextResponse } from "next/server";
import pool from '@/lib/mysql';

import { RowDataPacket } from 'mysql2';

interface KpiRow extends RowDataPacket {
    totalOrders: number;
    totalRevenue: string; // Decimal sum
    totalCustomers: number;
    lowStock: number;
}

interface SalesRow extends RowDataPacket {
    date: string;
    sales: string;
}

interface RecentOrderRow extends RowDataPacket {
    id: number;
    orderNumber: string;
    totalAmount: string;
    status: string;
    createdAt: Date;
    customerName: string;
}

interface RecentTicketRow extends RowDataPacket {
    id: number;
    subject: string;
    status: string;
    createdAt: Date;
    customerName: string;
}

export async function GET() {
    try {
        // 1. Get total revenue, orders, customers
        const [counts] = await pool.execute<KpiRow[]>(
            `SELECT 
                (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') as totalOrders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') as totalRevenue,
                (SELECT COUNT(*) FROM customers) as totalCustomers,
                (SELECT COUNT(*) FROM products WHERE stock_quantity <= 5) as lowStock`
        );

        const kpi = {
            revenue: parseFloat(counts[0].totalRevenue),
            orders: counts[0].totalOrders,
            customers: counts[0].totalCustomers,
            lowStock: counts[0].lowStock
        };

        // 2. Sales Chart (Last 30 Days)
        const [dailySales] = await pool.execute<SalesRow[]>(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                SUM(total_amount) as sales
             FROM orders
             WHERE status != 'cancelled' 
               AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY date
             ORDER BY date ASC`
        );

        // Fill in missing days
        const salesMap = new Map();
        dailySales.forEach((day) => {
            salesMap.set(day.date, parseFloat(day.sales));
        });

        const salesChart = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            salesChart.push({
                date: dateStr,
                sales: salesMap.get(dateStr) || 0
            });
        }

        // 3. Get recent orders
        const [recentOrders] = await pool.execute<RecentOrderRow[]>(
            `SELECT 
                o.id,
                o.order_number as orderNumber,
                o.total_amount as totalAmount,
                o.status,
                o.created_at as createdAt,
                CONCAT(c.first_name, ' ', c.last_name) as customerName
             FROM orders o
             LEFT JOIN customers c ON o.customer_id = c.id
             ORDER BY o.created_at DESC
             LIMIT 5`
        );

        // 4. Recent Tickets (Mock or fetch from tickets table if exists, previously prisma.ticket)
        // Assuming 'tickets' table exists based on previous prism usage, but if not we return empty array to be safe
        let recentTickets: RecentTicketRow[] = [];
        try {
            const [tickets] = await pool.execute<RecentTicketRow[]>(
                `SELECT 
                    t.id, 
                    t.subject, 
                    t.status, 
                    t.created_at as createdAt,
                    CONCAT(c.first_name, ' ', c.last_name) as customerName
                 FROM tickets t
                 LEFT JOIN customers c ON t.customer_id = c.id
                 ORDER BY t.created_at DESC 
                 LIMIT 3`
            );
            recentTickets = tickets;
        } catch (e) {
            console.warn("Tickets table might not exist or error fetching tickets", e);
        }

        return NextResponse.json({
            kpi,
            salesChart,
            recentOrders,
            recentTickets
        });

    } catch (error: unknown) {
        console.error("Dashboard analytics error:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
