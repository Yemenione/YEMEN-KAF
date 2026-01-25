import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📱 Seeding App Config...');

    const configs = [
        {
            key: 'maintenance_mode',
            value: JSON.stringify({ enabled: false, message: "We are under maintenance. Please come back later." }),
            description: 'Toggle app access for users'
        },
        {
            key: 'force_update',
            value: JSON.stringify({
                android: { minVersion: "1.0.0", url: "https://play.google.com/store" },
                ios: { minVersion: "1.0.0", url: "https://apps.apple.com" }
            }),
            description: 'Minimum required versions'
        },
        {
            key: 'home_banners',
            value: JSON.stringify([
                { id: 1, imageUrl: "https://placehold.co/600x400/png", action: "none", target: "" },
                { id: 2, imageUrl: "https://placehold.co/600x400/png", action: "category", target: "1" }
            ]),
            description: 'Home screen sliders'
        },
        {
            key: 'contact_info',
            value: JSON.stringify({
                whatsapp: "+33600000000",
                email: "support@yemenkaf.com",
                phone: "+33100000000"
            }),
            description: 'Contact details in app'
        }
    ];

    for (const config of configs) {
        await prisma.appConfig.upsert({
            where: { key: config.key },
            update: {},
            create: config
        });
    }

    console.log('✅ App Config Seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
