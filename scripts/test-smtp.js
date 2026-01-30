const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
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

// Decode password if it contains special characters (already done above, but safe to verify)
const decodedPassword = password;

async function verifySmtp() {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection({
            host,
            user,
            password: decodedPassword,
            database,
            port: parseInt(port)
        });

        console.log('✅ Connected to database.');

        // Fetch SMTP Config
        const keys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_email'];
        const config = {};

        for (const key of keys) {
            // Check process.env first (Priority 0 - based on our config strategy)
            const envKey = key.toUpperCase();
            if (envConfig[envKey]) {
                config[key] = envConfig[envKey];
                continue;
            }

            // Check DB
            const [rows] = await connection.execute(
                'SELECT value FROM store_config WHERE `key` = ? LIMIT 1',
                [key]
            );
            if (rows.length > 0) {
                config[key] = rows[0].value ? rows[0].value.trim() : '';
            }
        }

        // Debug Hostname
        if (config.smtp_host) {
            console.log(`Debug Host: '${config.smtp_host}' (Length: ${config.smtp_host.length})`);
            console.log('Char Codes:', config.smtp_host.split('').map(c => c.charCodeAt(0)).join(', '));
        }

        console.log('\n📧 SMTP Configuration Found:');
        console.log(`   Host: ${config.smtp_host || 'MISSING'}`);
        console.log(`   Port: ${config.smtp_port || 'MISSING'}`);
        console.log(`   User: ${config.smtp_user || 'MISSING'}`);
        console.log(`   Pass: ${config.smtp_password ? '********' : 'MISSING'}`);
        console.log(`   From: ${config.smtp_from_email || 'MISSING'}`);

        if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
            console.error('\n❌ Missing required SMTP credentials in Database or .env');
            process.exit(1);
        }

        // Create Transporter
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: Number(config.smtp_port) || 587,
            secure: Number(config.smtp_port) === 465, // true for 465, false for other ports
            auth: {
                user: config.smtp_user,
                pass: config.smtp_password,
            },
        });

        console.log('\n🔄 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful! server is ready to take our messages');

        // Optional: Send a test email if an argument is provided
        const testEmail = process.argv[2];
        if (testEmail) {
            console.log(`\n📨 Sending test email to ${testEmail}...`);
            const info = await transporter.sendMail({
                from: `"${config.smtp_from_name || 'Test'}" <${config.smtp_from_email}>`,
                to: testEmail,
                subject: 'SMTP Verification Test',
                text: 'If you received this, your SMTP configuration is working perfectly!',
                html: '<b>If you received this, your SMTP configuration is working perfectly!</b>'
            });
            console.log('✅ Test email sent: %s', info.messageId);
        }

    } catch (error) {
        console.error('\n❌ SMTP Verification Failed:', error.message);
        if (error.code === 'EAUTH') {
            console.error('   👉 Check your Username and Password.');
        } else if (error.code === 'ESOCKET') {
            console.error('   👉 Check your Host and Port settings.');
        }
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

verifySmtp();
