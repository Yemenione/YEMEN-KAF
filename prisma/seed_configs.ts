import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding store configurations...');

    const configs = [
        // Firebase Config (Replace with real values or pull from .env if needed)
        { key: 'firebase_apiKey', value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '', group: 'firebase', isPublic: true },
        { key: 'firebase_authDomain', value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '', group: 'firebase', isPublic: true },
        { key: 'firebase_projectId', value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '', group: 'firebase', isPublic: true },
        { key: 'firebase_storageBucket', value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '', group: 'firebase', isPublic: true },
        { key: 'firebase_messagingSenderId', value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '', group: 'firebase', isPublic: true },
        { key: 'firebase_appId', value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '', group: 'firebase', isPublic: true },

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
