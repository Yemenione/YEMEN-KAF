import mysql, { RowDataPacket } from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

interface ConfigRow extends RowDataPacket {
    key: string;
    value: string;
}

async function fix() {
    try {
        console.log('Detecting swapped Stripe keys...');

        const [rows] = await pool.execute<ConfigRow[]>('SELECT `key`, `value` FROM store_config WHERE `key` IN ("stripe_publishable_key", "stripe_secret_key")');

        const pub = rows.find(r => r.key === 'stripe_publishable_key');
        const sec = rows.find(r => r.key === 'stripe_secret_key');

        if (pub && sec && pub.value.startsWith('sk_') && sec.value.startsWith('pk_')) {
            console.log('Swapping back detected mismatched keys...');

            await pool.execute('UPDATE store_config SET `value` = ? WHERE `key` = ?', [sec.value, 'stripe_publishable_key']);
            await pool.execute('UPDATE store_config SET `value` = ? WHERE `key` = ?', [pub.value, 'stripe_secret_key']);

            console.log('SUCCESS: Keys swapped correctly.');
        } else {
            console.log('No swap needed or keys not found in current state.');
        }

    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('Fix failed:', msg);
    } finally {
        await pool.end();
        process.exit();
    }
}

fix();
