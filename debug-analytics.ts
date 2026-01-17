
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalytics() {
    try {
        console.log("Testing KPIs...");
        const totalRevenueResult = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: 'Cancelled' } }
        });
        console.log("Revenue:", totalRevenueResult._sum.totalAmount);

        const totalOrders = await prisma.order.count();
        console.log("Orders:", totalOrders);

        console.log("Testing Recent Orders...");
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { firstName: true, lastName: true } } }
        });
        console.log("Recent Orders count:", recentOrders.length);

        console.log("Testing Recent Tickets...");
        const recentTickets = await prisma.ticket.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { firstName: true, lastName: true } } }
        });
        console.log("Recent Tickets count:", recentTickets.length);

        process.exit(0);
    } catch (error) {
        console.error("DEBUG ERROR:", error);
        process.exit(1);
    }
}

testAnalytics();
