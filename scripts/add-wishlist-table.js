
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load env vars from .env file
dotenv.config({ path: '.env' });

async function main() {
    console.log('Starting wishlist table creation...');

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

        console.log('Connected to database.');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_wishlist (user_id, product_id)
            ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
        `);

        console.log('Wishlists table created successfully.');

    } catch (error) {
        console.error('Error applying schema:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
