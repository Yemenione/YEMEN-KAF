import pool from './lib/mysql';

async function inspect() {
    try {
        const [rows]: any = await pool.execute('SELECT `key`, `value` FROM store_config WHERE `key` LIKE ?', ['%stripe%']);
        console.log('Stripe Configs in DB:');
        rows.forEach((row: any) => {
            console.log(`${row.key}: ${row.value.substring(0, 7)}...`);
        });

        const [methods]: any = await pool.execute('SELECT `key`, `value` FROM store_config WHERE `key` = ?', ['payment_methods']);
        if (methods.length > 0) {
            console.log('\nPayment Methods JSON:');
            console.log(methods[0].value);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

inspect();
