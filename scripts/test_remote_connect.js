require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    console.log(`Attempting to connect to ${process.env.DB_HOST}...`);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectTimeout: 5000
        });
        console.log('Successfully connected to remote database!');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

test();
