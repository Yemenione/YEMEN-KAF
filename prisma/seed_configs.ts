import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding store configurations...');

    const configs = [
        // Stripe Config
        { key: 'stripe_publishable_key', value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '', group: 'stripe', isPublic: true },
        { key: 'stripe_secret_key', value: process.env.STRIPE_SECRET_KEY || '', group: 'stripe', isPublic: false },
        { key: 'stripe_webhook_secret', value: '', group: 'stripe', isPublic: false },
    ];

    for (const conf of configs) {
        await prisma.storeConfig.upsert({
            where: { key: conf.key },
            update: {
                value: conf.value,
                group: conf.group,
                isPublic: conf.isPublic,
                type: 'text'
            },
            create: {
                key: conf.key,
                value: conf.value,
                group: conf.group,
                isPublic: conf.isPublic,
                type: 'text'
            }
        });
        console.log(`- Set ${conf.key}`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
