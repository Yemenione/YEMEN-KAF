
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@yemenimarket.com';
    const password = 'AdminPassword123!';
    const name = 'Super Admin';

    console.log(`Hashing password for ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Upserting admin user...');
    const admin = await prisma.admin.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN' // Ensure role is set on update too
        },
        create: {
            email,
            passwordHash: hashedPassword,
            name,
            role: 'SUPER_ADMIN',
        },
    });

    console.log(`✅ Admin user ready: ${admin.email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
