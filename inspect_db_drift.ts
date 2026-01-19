
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function inspectTables() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        console.log("--- ORDERS TABLE ---");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [orderCols] = await connection.execute<any[]>('SHOW COLUMNS FROM orders');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.table(orderCols.map((c: any) => ({ Field: c.Field, Type: c.Type })));

        console.log("\n--- PRODUCTS TABLE ---");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [productCols] = await connection.execute<any[]>('SHOW COLUMNS FROM products');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.table(productCols.map((c: any) => ({ Field: c.Field, Type: c.Type })));

        process.exit(0);
    } catch (error) {
        console.error("INSPECTION ERROR:", error);
        process.exit(1);
    }
}

inspectTables();
