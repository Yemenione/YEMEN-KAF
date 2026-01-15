import prisma from '../lib/db.ts';

async function testConnection() {
    console.log('Testing Prisma connection...');
    try {
        // Attempt to count customers (should be 0)
        const customerCount = await prisma.customer.count();
        console.log('✅ Prisma connection successful!');
        console.log('Current customer count:', customerCount);
    } catch (err) {
        console.error('❌ Prisma connection failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
