const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Parse DATABASE_URL
const dbUrl = envConfig.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

// Parse DATABASE_URL using URL class for robustness
let user, password, host, port, database;
try {
    const dbUri = new URL(dbUrl);
    user = dbUri.username;
    password = decodeURIComponent(dbUri.password);
    host = dbUri.hostname;
    port = dbUri.port;
    database = dbUri.pathname.substring(1); // Remove leading slash
} catch (e) {
    console.error('❌ Failed to parse DATABASE_URL:', e.message);
    process.exit(1);
}

async function updateSmtpPort() {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection({
            host,
            user,
            password,
            database,
            port: parseInt(port)
        });

        console.log('✅ Connected.');

        // Update both tables just in case
        console.log('🔄 Updating SMTP Port to 465 (SSL)...');

        await connection.execute(
            'UPDATE app_configs SET value = "465" WHERE `key` = "smtp_port"'
        );

        await connection.execute(
            'UPDATE store_config SET value = "465" WHERE `key` = "smtp_port"'
        );

        console.log('✅ SMTP Port updated to 465.');

    } catch (error) {
        console.error('❌ Update Failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

updateSmtpPort();
