import mysql from 'mysql2/promise';

/**
 * Direct MySQL Connection Pool
 * Use this as a robust fallback/alternative to Prisma 
 * when engines or generators are failing in specific environments.
 */
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;
