
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding Ramadan data...');

    // 1. Fetch some active products to feature
    const products = await prisma.product.findMany({
        where: { isActive: true },
        take: 4,
        select: { id: true, name: true }
    });

    if (products.length === 0) {
        console.warn('No active products found. Please create products first.');
        return;
    }

    const productIds = products.map(p => p.id);
    console.log('Found products for Ramadan specials:', products.map(p => p.name));

    // 2. Upsert StoreConfig entries
    const configs = [
        {
            key: 'ramadan_mode_enabled',
            value: 'true',
            type: 'boolean',
            group: 'ramadan',
            description: 'Enable or disable the Ramadan special section',
            isPublic: true
        },
        {
            key: 'ramadan_title',
            value: 'Ramadan Kareem Specials',
            type: 'text',
            group: 'ramadan',
            description: 'Title for the Ramadan section',
            isPublic: true
        },
        {
            key: 'ramadan_subtitle',
            value: 'Discover our curated selection for the holy month. Traditional flavors and premium quality.',
            type: 'text',
            group: 'ramadan',
            description: 'Subtitle for the Ramadan section',
            isPublic: true
        },
        {
            key: 'ramadan_product_ids',
            value: JSON.stringify(productIds),
            type: 'json',
            group: 'ramadan',
            description: 'List of product IDs to display in Ramadan section',
            isPublic: true
        }
    ];

    for (const config of configs) {
        await prisma.storeConfig.upsert({
            where: { key: config.key },
            update: config,
            create: config,
        });
        console.log(`Upserted config: ${config.key}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
