import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// Manually set if needed (since I renamed it)
if (!process.env.DATABASE_URL && process.env.MYSQL_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.MYSQL_DATABASE_URL;
}

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing Prisma connection with URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
    try {
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('SUCCESS:', result);
    } catch (e) {
        console.error('FAILURE:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
