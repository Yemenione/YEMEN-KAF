const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    console.log('Testing mysql2 connection...');
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const [rows] = await connection.execute('SELECT 1 as result');
        console.log('SUCCESS:', rows);
        await connection.end();
    } catch (e) {
        console.error('FAILURE:', e);
    }
}
test();
