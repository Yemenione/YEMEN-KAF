import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import 'dotenv/config';

async function main() {
    console.log('Counting products in DB...');

    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
        throw new Error('Missing database environment variables');
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });



    try {
        const [rows] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM products');
        console.log('Product Count:', rows[0].count);

        const [products] = await connection.execute('SELECT id, name, category_id FROM products LIMIT 5');
        console.table(products);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

main();
