const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to fetch storeConfig...');
        const configs = await prisma.storeConfig.findMany();
        console.log('Success! Found configs:', configs.length);
        console.log(configs);
    } catch (e) {
        console.error('Error fetching storeConfig:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
