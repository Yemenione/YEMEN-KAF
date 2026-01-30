require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyConfigs() {
    console.log(`Checking configurations on ${process.env.DB_HOST}...`);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [storeConfig] = await connection.execute('SELECT * FROM store_config');
        const [appConfig] = await connection.execute('SELECT * FROM app_configs');

        console.log('--- CONFIGURATION REPORT ---');
        console.log(`Store Config Entries: ${storeConfig.length}`);
        if (storeConfig.length > 0) {
            storeConfig.forEach(c => console.log(` [Store] ${c.key}: ${c.value.substring(0, 50)}...`));
        } else {
            console.log('⚠️ STORE CONFIG IS EMPTY!');
        }

        console.log(`App Config Entries: ${appConfig.length}`);
        if (appConfig.length > 0) {
            appConfig.forEach(c => console.log(` [App] ${c.key}: ${c.value.substring(0, 50)}...`));
        } else {
            console.log('⚠️ APP CONFIG IS EMPTY!');
        }

    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await connection.end();
    }
}

verifyConfigs();
