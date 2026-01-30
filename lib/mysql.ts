import mysql from 'mysql2/promise';

/**
 * Direct MySQL Connection Pool
 * Optimized with singleton pattern for Next.js development.
 */
const globalForPool = global as unknown as { pool: mysql.Pool };

export const pool =
    globalForPool.pool ||
    mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 1, // Only 1 connection to prevent shared hosting limits
        queueLimit: 0,
    });

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

export default pool;
