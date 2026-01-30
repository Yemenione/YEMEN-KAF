require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function deploySeed() {
    console.log(`Connecting to ${process.env.DB_HOST}...`);

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'yemeni_market_seed.sql');
    if (!fs.existsSync(sqlPath)) {
        throw new Error('Seed file not found at ' + sqlPath);
    }
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true // Enable multiple statements query
    });

    console.log('Connected! Executing seed SQL...');

    try {
        await connection.query(sqlContent);
        console.log('✅ Remote database seeded successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.sqlMessage || err.message);
    } finally {
        await connection.end();
    }
}

deploySeed().catch(console.error);
