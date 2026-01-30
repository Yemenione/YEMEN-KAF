const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Parse DATABASE_URL
const dbUrl = envConfig.DATABASE_URL;
if (!dbUrl) process.exit(1);

let user, password, host, port, database;
try {
    const dbUri = new URL(dbUrl);
    user = dbUri.username;
    password = decodeURIComponent(dbUri.password);
    host = dbUri.hostname;
    port = dbUri.port;
    database = dbUri.pathname.substring(1);
} catch (e) {
    process.exit(1);
}

async function checkLatestOrder() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host, user, password, database, port: parseInt(port)
        });

        console.log('🔍 Checking last 5 orders...');

        const [rows] = await connection.execute(
            'SELECT id, order_number, status, total_amount, created_at FROM orders ORDER BY id DESC LIMIT 5'
        );

        if (rows.length > 0) {
            console.log(`✅ Found ${rows.length} recent orders:`);
            rows.forEach(order => {
                const createdDate = new Date(order.created_at);
                // Adjust for TZ if needed, but showing ISO is safest
                const diffMinutes = (Date.now() - createdDate.getTime()) / 60000;

                console.log(`\n🔹 [ID: ${order.id}] Order #${order.order_number}`);
                console.log(`   Status: ${order.status}`);
                console.log(`   Created At: ${createdDate.toISOString()}`);
                console.log(`   Time Ago: ${diffMinutes.toFixed(1)} minutes`);
                console.log(`   Total: ${order.total_amount} €`);

                if (diffMinutes < 10) {
                    console.log('   ✨ THIS LOOKS LIKE A NEW ORDER!');
                }
            });
        } else {
            console.log('❌ No orders found in the database.');
        }

    } catch (error) {
        console.error('❌ Error checking orders:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkLatestOrder();
