import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        passwordLength: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0,
        hasUrl: !!process.env.DATABASE_URL
    };

    try {
        // Try connecting using the same logic as lib/mysql
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        await connection.end();

        return NextResponse.json({
            status: 'success',
            message: 'Successfully connected to database!',
            config_seen: config
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            config_seen: config,
            env_vars_loaded: {
                DB_HOST: !!process.env.DB_HOST,
                DB_USER: !!process.env.DB_USER,
                DB_PASSWORD: !!process.env.DB_PASSWORD,
            }
        }, { status: 500 });
    }
}
