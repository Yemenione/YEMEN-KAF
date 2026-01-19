import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function inspectWishlist() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        console.log("--- WISHLISTS TABLE ---");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [cols] = await connection.execute<any[]>('SHOW COLUMNS FROM wishlists');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.table(cols.map((c: any) => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key })));

        process.exit(0);
    } catch (error) {
        console.error("INSPECTION ERROR:", error);
        process.exit(1);
    }
}

inspectWishlist();
