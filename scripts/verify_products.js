require('dotenv').config();
const mysql = require('mysql2/promise');

async function verify() {
    console.log(`Checking database: ${process.env.DB_NAME} on ${process.env.DB_HOST}...`);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [products] = await connection.execute('SELECT id, name FROM products');
        const [admins] = await connection.execute('SELECT email FROM admins');

        console.log('--- VERIFICATION REPORT ---');
        console.log(`Admins found: ${admins.length}`);
        admins.forEach(a => console.log(` - ${a.email}`));

        console.log(`Products found: ${products.length}`);
        products.forEach(p => console.log(` - ${p.name}`));

    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await connection.end();
    }
}

verify();
