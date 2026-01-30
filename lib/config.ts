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
        if (appRows && appRows.length > 0) return appRows[0].value ? appRows[0].value.trim() : '';

        // 2. Try store_config table (Original system)
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT value FROM store_config WHERE `key` = ? LIMIT 1',
            [key]
        );

        if (rows && rows.length > 0) {
            return rows[0].value ? rows[0].value.trim() : '';
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

        // ... DB lookups ...

        // 3. Fallback to Environment Variables
        const envKey = key.toUpperCase();
        if (process.env[envKey]) {
            return process.env[envKey];
        }

        // Handle specific mappings
        if (key === 'stripe_publishable_key' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        }

        return undefined;
    } catch (error) {
        console.error(`Error fetching config for key: ${key}`, error);
        // Fallback on error too
        const envKey = key.toUpperCase();
        if (process.env[envKey]) return process.env[envKey];
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
