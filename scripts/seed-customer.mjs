import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function seed() {
    console.log('Seeding test customer account via Raw SQL...');

    try {
        // 1. Create Customer
        await prisma.$executeRaw`
      INSERT INTO customers (first_name, last_name, email, password_hash, phone) 
      VALUES ('Saleh', 'Al-Yemeni', 'user@yemkaf.com', 'password123', '+967 777 777 777')
      ON DUPLICATE KEY UPDATE email=email;
    `;

        // Get Customer ID
        const customer = await prisma.$queryRaw`SELECT id FROM customers WHERE email = 'user@yemkaf.com' LIMIT 1;`;
        const customerId = customer[0].id;

        // 2. Add Address
        await prisma.$executeRaw`
      INSERT INTO addresses (customer_id, label, is_default, street_address, city, country, phone)
      VALUES (${customerId}, 'Home', 1, 'Main Street, Al-Hadda', 'Sanaa', 'Yemen', '+967 777 777 777');
    `;

        console.log('✅ Test account created successfully!');
        console.log('--- Credentials ---');
        console.log('Email: user@yemkaf.com');
        console.log('Password: password123');
        console.log('-------------------');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
