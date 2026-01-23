
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

import { cache } from 'react';

/**
 * Verify if the current request is from an authenticated administrator.
 * Returns the admin session data or null if not authorized.
 * Cached at the request level to avoid multiple DB lookups.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
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
    } catch (error) {
        console.error("Session verification error:", error);
        return null;
    }
});

import { Permission, hasPermission } from './rbac';

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

/**
 * Enforce a specific permission check.
 */
export async function verifyPermission(permission: Permission) {
    const { authorized, admin, response } = await verifyAdmin();
    if (!authorized || !admin) return { authorized, response };

    if (!hasPermission(admin.role, permission)) {
        return {
            authorized: false,
            response: Response.json({ error: `Forbidden: Missing permission ${permission}` }, { status: 403 })
        };
    }

    return { authorized: true, admin };
}
