import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const couponCode = 'WELCOME2026';

    const existing = await prisma.cartRule.findUnique({
        where: { code: couponCode }
    });

    if (existing) {
        console.log(`Coupon ${couponCode} already exists.`);
    } else {
        await prisma.cartRule.create({
            data: {
                name: 'Welcome Offer 2026',
                code: couponCode,
                description: 'Special welcome discount for new users.',
                isActive: true,
                reductionPercent: 20.0,
                minAmount: 0,
                totalAvailable: 1000,
                totalPerUser: 1,
                freeShipping: true,
                startsAt: new Date(),
            }
        });
        console.log(`Created coupon ${couponCode} with 20% off and free shipping.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
