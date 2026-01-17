
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function inspectTables() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        console.log("--- ORDERS TABLE ---");
        const [orderCols]: any = await connection.execute('SHOW COLUMNS FROM orders');
        console.table(orderCols.map((c: any) => ({ Field: c.Field, Type: c.Type })));

        console.log("\n--- PRODUCTS TABLE ---");
        const [productCols]: any = await connection.execute('SHOW COLUMNS FROM products');
        console.table(productCols.map((c: any) => ({ Field: c.Field, Type: c.Type })));

        process.exit(0);
    } catch (error) {
        console.error("INSPECTION ERROR:", error);
        process.exit(1);
    }
}

inspectTables();
