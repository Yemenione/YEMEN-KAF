import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Store Configuration ---');
    const configs = await prisma.storeConfig.findMany();
    if (configs.length === 0) {
        console.log('No configurations found.');
    } else {
        configs.forEach(c => {
            console.log(`${c.key}: ${c.value}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
