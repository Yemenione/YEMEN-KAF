
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Protection for Admin Routes
    if (path.startsWith('/admin-portal')) {
        // Exclude public admin routes if any (e.g. login if it was inside, but it's separate)
        // If /admin-portal/login exists, exclude it.
        if (path === '/admin-portal/login') {
            return NextResponse.next();
        }

        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            // Redirect to main login page with a return URL or just invalid permission
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Verify JWT
            const { payload } = await jwtVerify(token, JWT_SECRET);

            // Check Admin Role
            // Payload should have isAdmin or role.
            // Based on my previous login route edit: isAdmin: boolean, role: string
            const isAdmin = payload.isAdmin === true ||
                payload.role === 'SUPER_ADMIN' ||
                payload.role === 'ADMIN';

            if (!isAdmin) {
                // Logged in but not admin
                console.log('Middleware: User is not admin, redirecting to shop');
                return NextResponse.redirect(new URL('/account', request.url));
            }

            // Valid Admin
            return NextResponse.next();

        } catch (error) {
            console.error('Middleware: Token verification failed', error);
            // potentially clear cookie?
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin-portal/:path*',
    ],
};
