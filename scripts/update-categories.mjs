import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateCategories() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('🔄 Updating categories...');

        const sqlFile = fs.readFileSync(
            path.join(__dirname, 'update-categories.sql'),
            'utf8'
        );

        const statements = sqlFile
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('✅ Categories updated successfully!');

        // Show categories
        const [cats] = await connection.query('SELECT id, name, slug, display_order FROM categories ORDER BY display_order');
        console.log(`\n📁 Categories (${cats.length}):`);
        cats.forEach(cat => {
            console.log(`   ${cat.id}. ${cat.name} (${cat.slug})`);
        });

    } catch (error) {
        console.error('❌ Update failed:', error);
    } finally {
        await connection.end();
    }
}

updateCategories();
