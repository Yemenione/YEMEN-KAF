import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function importProducts() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('🔄 Starting product import...');

        // Read SQL file
        const sqlFile = fs.readFileSync(
            path.join(__dirname, 'import-products.sql'),
            'utf8'
        );

        // Split by semicolons and execute each statement
        const statements = sqlFile
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('✅ Products imported successfully!');

        // Show summary
        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');

        console.log(`📊 Summary:`);
        console.log(`   - Categories: ${categories[0].count}`);
        console.log(`   - Products: ${products[0].count}`);

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await connection.end();
    }
}

importProducts();
