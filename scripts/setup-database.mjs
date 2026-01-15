import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('🔄 Setting up database...');

        const sqlFile = fs.readFileSync(
            path.join(__dirname, 'setup-database.sql'),
            'utf8'
        );

        // Split by semicolons and execute
        const statements = sqlFile
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (err) {
                console.log('⚠️  Statement:', statement.substring(0, 50) + '...');
                console.log('   Error:', err.message);
            }
        }

        console.log('✅ Database setup complete!');

        // Show summary
        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');

        console.log(`\n📊 Summary:`);
        console.log(`   - Categories: ${categories[0].count}`);
        console.log(`   - Products: ${products[0].count}`);

        // Show categories
        const [cats] = await connection.query('SELECT id, name, slug FROM categories ORDER BY display_order');
        console.log(`\n📁 Categories:`);
        cats.forEach(cat => {
            console.log(`   ${cat.id}. ${cat.name} (${cat.slug})`);
        });

    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await connection.end();
    }
}

setupDatabase();
