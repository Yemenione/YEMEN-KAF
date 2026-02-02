import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // IMPORTANT: This only runs in development mode, NEVER in production!
    // In production, images are served directly from public/uploads/
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment && pathname.startsWith('/uploads/')) {
        // In development, proxy missing images from production server
        // This allows local development without downloading all product images
        const productionUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yemenimarket.fr'}${pathname}`;
        return NextResponse.rewrite(new URL(productionUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/uploads/:path*',
    ],
};
