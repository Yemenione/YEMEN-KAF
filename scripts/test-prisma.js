const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('💎 Testing Prisma Client...');
    const prisma = new PrismaClient({
        log: ['info', 'warn', 'error'],
    });

    try {
        console.log('Connecting to database...');
        // Attempt a simple query
        const count = await prisma.product.count();
        console.log(`✅ Success! Found ${count} products.`);
        console.log('🎉 Prisma Client is working correctly.');
    } catch (e) {
        console.error('❌ Prisma Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
