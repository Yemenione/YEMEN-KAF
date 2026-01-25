import pool from './mysql';
import { RowDataPacket } from 'mysql2';

/**
 * Fetches a configuration value from the database (StoreConfig table).
 * Falls back to environment variables if not found in DB.
 */
export async function getStoreConfig(key: string): Promise<string | undefined> {
    try {
        // 1. Try app_configs table first (Newer system)
        const [appRows] = await pool.execute<RowDataPacket[]>(
            'SELECT value FROM app_configs WHERE `key` = ? LIMIT 1',
            [key]
        );
        if (appRows && appRows.length > 0) return appRows[0].value;

        // 2. Try store_config table (Original system)
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT value FROM store_config WHERE `key` = ? LIMIT 1',
            [key]
        );

        if (rows && rows.length > 0) {
            return rows[0].value;
        }

        // Special check for nested stripe_config
        if (key === 'stripe_secret_key') {
            const [stripeRows] = await pool.execute<RowDataPacket[]>(
                'SELECT value FROM app_configs WHERE `key` = "stripe_config" LIMIT 1'
            );
            if (stripeRows && stripeRows.length > 0) {
                const config = JSON.parse(stripeRows[0].value);
                if (config.secretKey) return config.secretKey;
            }
        }

        return undefined;
    } catch (error) {
        console.error(`Error fetching config for key: ${key}`, error);
        return undefined;
    }
}

/**
 * Convenience helper for sensitive keys that should NEVER be exposed to the client.
 */
export async function getSecretConfig(key: string): Promise<string> {
    const value = await getStoreConfig(key);
    if (!value) {
        console.warn(`Warning: Missing secret config for ${key}`);
    }
    return value || '';
}
