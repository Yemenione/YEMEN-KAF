
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Protection for Admin Routes
    if (path.startsWith('/admin-portal')) {
        if (path === '/admin-portal/login') {
            return NextResponse.next();
        }

        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const isAdmin = payload.isAdmin === true ||
                payload.role === 'SUPER_ADMIN' ||
                payload.role === 'ADMIN';

            if (!isAdmin) {
                return NextResponse.redirect(new URL('/account', request.url));
            }
        } catch (error) {
            console.error('Middleware: Token verification failed', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }
    }

    // 2. Add CORS headers for static assets
    if (path.startsWith('/uploads/') || path.startsWith('/images/')) {
        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin-portal/:path*',
        '/uploads/:path*',
        '/images/:path*',
    ],
};
