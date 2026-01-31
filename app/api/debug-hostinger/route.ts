import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const dbUrl = process.env.DATABASE_URL;
        return NextResponse.json({
            status: 'alive',
            timestamp: new Date().toISOString(),
            env: {
                node_env: process.env.NODE_ENV,
                has_db_url: !!dbUrl,
                // Show first few chars to verify it's the right key, masking the rest
                db_url_prefix: dbUrl ? dbUrl.substring(0, 15) + '...' : 'MISSING',
                uv_threadpool: process.env.UV_THREADPOOL_SIZE || 'undefined',
                port: process.env.PORT,
            },
            server: {
                memory: process.memoryUsage(),
                uptime: process.uptime(),
            }
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
