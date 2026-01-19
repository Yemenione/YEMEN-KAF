import mysql, { RowDataPacket } from 'mysql2/promise';
import 'dotenv/config';

async function main() {
    console.log('Checking order_items table structure...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute<RowDataPacket[]>('DESCRIBE order_items');
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

main();
