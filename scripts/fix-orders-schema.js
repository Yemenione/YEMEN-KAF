
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars from .env file since .env.local was not found in listing
dotenv.config({ path: '.env' });

async function fixDatabase() {
    console.log('Starting database schema fix...');

    let connection;
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
            console.log('Connecting using DATABASE_URL...');
            connection = await mysql.createConnection(databaseUrl);
        } else {
            const dbConfig = {
                host: process.env.DB_HOST || '127.0.0.1',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'yemeni_market',
            };
            console.log('Connecting using individual params to:', dbConfig.database);
            connection = await mysql.createConnection(dbConfig);
        }

        // Drop tables if they exist to ensure clean schema
        console.log('Dropping existing orders and order_items tables...');
        await connection.execute('DROP TABLE IF EXISTS order_items');
        await connection.execute('DROP TABLE IF EXISTS orders');

        // Recreate orders table
        console.log('Creating orders table...');
        await connection.execute(`
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address JSON,
        payment_method VARCHAR(50),
        shipping_method VARCHAR(50),
        shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
    `);

        // Recreate order_items table
        console.log('Creating order_items table...');
        await connection.execute(`
      CREATE TABLE order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
    `);

        console.log('Database schema fixed successfully!');
    } catch (error) {
        console.error('Error fixing database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixDatabase();
