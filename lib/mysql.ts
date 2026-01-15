import mysql from 'mysql2/promise';

/**
 * Direct MySQL Connection Pool
 * Use this as a robust fallback/alternative to Prisma 
 * when engines or generators are failing in specific environments.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Fallback to URI if individual params are missing, though createPool signature handles one or the other usually. 
    // Best to construct the config object conditionally or just rely on the explicit ones since they are in .env
});

export default pool;
