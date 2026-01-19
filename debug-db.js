/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');


dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function inspect() {
    try {
        console.log('Inspecting Database Configs...\n');

        const [rows] = await pool.execute('SELECT `key`, `value`, `isPublic` FROM store_config WHERE `key` LIKE ? OR `key` = ?', ['%stripe%', 'payment_methods']);

        console.log('--- Store Config Table ---');
        rows.forEach(row => {
            const displayValue = row.value.length > 20 ? row.value.substring(0, 10) + '...' + row.value.substring(row.value.length - 5) : row.value;
            console.log(`Key: ${row.key.padEnd(25)} | Value: ${displayValue.padEnd(20)} | isPublic: ${row.isPublic}`);
        });

    } catch (e) {
        console.error('Inspection failed:', e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

inspect();
