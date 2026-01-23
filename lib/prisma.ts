import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * We use connection_limit=2 to survive strict provider limits (e.g. 500 conn/hour)
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
