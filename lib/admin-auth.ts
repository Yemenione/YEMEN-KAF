
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';

import { RowDataPacket } from 'mysql2';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export interface AdminSession {
    id: number;
    email: string;
    role: string;
}

/**
 * Verify if the current request is from an authenticated administrator.
 * Returns the admin session data or null if not authorized.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return null;

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        // Verify that this user ID exists in the ADMINS table, not just customers
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, email, role FROM admins WHERE id = ? LIMIT 1',
            [userId]
        );

        if (rows.length === 0) {
            // Secondary check: If they are a super-admin by email (emergency fallback)
            // This is useful if the ID mapping isn't 1:1 between customers/admins 
            // but the payload contains the email.
            if (payload.email) {
                const [emailRows] = await pool.execute<RowDataPacket[]>(
                    'SELECT id, email, role FROM admins WHERE email = ? LIMIT 1',
                    [payload.email]
                );
                if (emailRows.length > 0) return emailRows[0] as AdminSession;
            }
            return null;
        }

        return rows[0] as AdminSession;
    } catch {
        return null;
    }
}

/**
 * Helper to enforce admin check and return unauthorized response if failed.
 */
export async function verifyAdmin() {
    const admin = await getAdminSession();
    if (!admin) {
        return { authorized: false, response: Response.json({ error: 'Unauthorized: Admin access required' }, { status: 401 }) };
    }
    return { authorized: true, admin };
}
