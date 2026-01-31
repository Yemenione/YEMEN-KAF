import 'dotenv/config'; // ⚡ Force load .env
import { PrismaClient } from '@prisma/client';

// Prisma Client Singleton
// On shared hosting, we MUST strictly limit connections.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
    let url = process.env.DATABASE_URL || "";
    console.log('[Prisma] Initializing client. URL present:', !!url);

    if (!url) {
        console.error('[Prisma] ❌ DATABASE_URL is missing!');
    }

    // Force connection_limit=1 for shared hosting stability if not already specified
    if (url && !url.includes('connection_limit')) {
        url += (url.includes('?') ? '&' : '?') + 'connection_limit=1';
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
