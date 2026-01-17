import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // 1. KPIs
        // 1. KPIs
        // WORKAROUND: Avoid prisma.order.aggregate due to "timer has gone away" panic on hosting
        const allOrders = await prisma.order.findMany({
            where: { status: { not: 'Cancelled' } },
            select: { totalAmount: true }
        });
        const totalRevenue = allOrders.reduce((sum: number, order: { totalAmount: any }) => sum + Number(order.totalAmount), 0);

        const totalOrders = await prisma.order.count();
        const totalCustomers = await prisma.customer.count();
        const lowStockCount = await prisma.product.count({
            where: { stockQuantity: { lte: 5 } }
        });

        // 2. Sales Chart (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesRaw = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: { not: 'Cancelled' }
            },
            select: {
                createdAt: true,
                totalAmount: true
            }
        });

        // Aggregate by day
        const salesMap = new Map();
        salesRaw.forEach((order: any) => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            const amount = Number(order.totalAmount);
            salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + amount);
        });

        const salesChart = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            salesChart.unshift({
                date: dateStr,
                sales: salesMap.get(dateStr) || 0
            });
        }


        // 3. Recent Activity (Orders & Tickets)
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { firstName: true, lastName: true } } }
        });

        const recentTickets = await (prisma as any).ticket.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { firstName: true, lastName: true } } }
        });

        return NextResponse.json({
            kpi: {
                revenue: totalRevenue,
                orders: totalOrders,
                customers: totalCustomers,
                lowStock: lowStockCount
            },
            salesChart,
            recentOrders,
            recentTickets
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
