
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        console.log("Applying migrations...");

        // Orders additions
        await connection.execute('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(191) NULL');
        await connection.execute('ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier_data JSON NULL');

        // Products additions
        await connection.execute('ALTER TABLE products ADD COLUMN IF NOT EXISTS hs_code VARCHAR(191) NULL');
        await connection.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country VARCHAR(191) NULL DEFAULT 'Yemen'");

        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        console.error("MIGRATION ERROR:", error);
        process.exit(1);
    }
}

migrate();
