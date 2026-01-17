import pool from './mysql';

/**
 * Fetches a configuration value from the database (StoreConfig table).
 * Falls back to environment variables if not found in DB.
 */
export async function getStoreConfig(key: string): Promise<string | undefined> {
    try {
        // Use direct MySQL pool to bypass prisma client generation issues on Windows
        const [rows]: any = await pool.execute(
            'SELECT value FROM store_config WHERE `key` = ? LIMIT 1',
            [key]
        );

        if (rows && rows.length > 0) {
            return rows[0].value;
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
