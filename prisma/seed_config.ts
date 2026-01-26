import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const configs = [
        {
            key: 'support_email',
            value: 'support@yemenkaf.com',
            isPublic: true,
            group: 'general',
        },
        {
            key: 'support_phone',
            value: '+967 777 123 456',
            isPublic: true,
            group: 'general',
        },
        {
            key: 'support_faq_json',
            value: JSON.stringify([
                {
                    question: 'How to place an order?',
                    answer: 'Browse products, add to cart, and proceed to checkout.',
                },
                {
                    question: 'How to track my order?',
                    answer: 'Go to Orders History in your profile and click Track.',
                },
                {
                    question: 'What is the return policy?',
                    answer: 'You can return items within 14 days of receipt.',
                },
            ]),
            isPublic: true,
            group: 'general',
        },
        {
            key: 'app_splash_url',
            value: 'http://127.0.0.1:3000/images/splash_bg.png',
            isPublic: true,
            group: 'assets',
        },
        {
            key: 'app_banner_honey_url',
            value: 'http://127.0.0.1:3000/images/banner_honey.png',
            isPublic: true,
            group: 'assets',
        },
        {
            key: 'app_banner_coffee_url',
            value: 'http://127.0.0.1:3000/images/banner_coffee.png',
            isPublic: true,
            group: 'assets',
        },
    ];

    for (const config of configs) {
        await prisma.storeConfig.upsert({
            where: { key: config.key },
            update: {
                value: config.value,
                isPublic: config.isPublic,
            },
            create: {
                key: config.key,
                value: config.value,
                isPublic: config.isPublic,
                group: config.group,
                type: 'text',
            },
        });
    }

    console.log('Store config seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
