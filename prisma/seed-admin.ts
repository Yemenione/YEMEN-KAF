import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Admin seed...');

    const email = 'admin@yemeni-market.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.upsert({
        where: { email },
        update: {
            role: AdminRole.SUPER_ADMIN,
        },
        create: {
            email,
            name: 'Super Admin',
            passwordHash: hashedPassword,
            role: AdminRole.SUPER_ADMIN,
        },
    });

    console.log(`
    IMPORTANT:
    Admin user configured:
    Email: ${admin.email}
    Password: ${password}
    Role: ${admin.role}
    `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
