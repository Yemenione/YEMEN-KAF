import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function inspect() {
    try {
        console.log('Inspecting Database Configs...\n');

        interface ConfigRow extends mysql.RowDataPacket {
            key: string;
            value: string;
            isPublic: number;
        }

        const [rows] = await pool.execute<ConfigRow[]>('SELECT `key`, `value`, `isPublic` FROM store_config WHERE `key` LIKE ? OR `key` = ?', ['%stripe%', 'payment_methods']);

        console.log('--- Store Config Table ---');
        rows.forEach((row) => {
            const displayValue = row.value.length > 20 ? row.value.substring(0, 10) + '...' + row.value.substring(row.value.length - 5) : row.value;
            console.log(`Key: ${row.key.padEnd(25)} | Value: ${displayValue.padEnd(20)} | isPublic: ${row.isPublic}`);
        });

    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('Inspection failed:', msg);
    } finally {
        await pool.end();
        process.exit();
    }
}

inspect();
