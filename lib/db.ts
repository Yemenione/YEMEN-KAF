import { PrismaClient } from '@prisma/client';
import 'server-only';

const prismaClientSingleton = () => {
    console.log('DEBUG: Initializing Prisma with URL:', process.env.MYSQL_DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
    return new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

/**
 * NOTE ON POSTGRESQL:
 * To use PostgreSQL alongside or instead of MySQL:
 * 1. Add your POSTGRES_URL to .env
 * 2. Update provider in prisma/schema.prisma to "postgresql"
 * 3. Update url in prisma.config.ts if needed
 * 4. Run 'npx prisma db push' to sync schema
 */
