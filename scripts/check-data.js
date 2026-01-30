
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: {
            id: true,
            name: true,
            images: true,
            category: {
                select: {
                    name: true
                }
            }
        }
    });
    console.log('--- PRODUCTS DATA ---');
    console.log(JSON.stringify(products, null, 2));

    const configs = await prisma.storeConfig.findMany({
        where: {
            key: { in: ['logo_url', 'logo_width_desktop', 'site_name'] }
        }
    });
    console.log('\n--- STORE CONFIG ---');
    console.log(JSON.stringify(configs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
