const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    console.log('Verifying categories in DB...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute('SELECT id, name, slug, image_url FROM categories');
        console.log('Current Categories in DB:');
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

main();
