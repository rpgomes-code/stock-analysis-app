// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const protectedPaths = [
    '/portfolio',
    '/settings',
];

// Paths that are exclusively for non-authenticated users
const authPaths = [
    '/auth/signin',
    '/auth/signup',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is protected or auth-only
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.some(path => pathname === path);

    // Get the auth token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Redirect logic
    if (isProtectedPath && !token) {
        // Redirect to signin if trying to access protected route while not authenticated
        const url = new URL('/auth/signin', request.url);
        url.searchParams.set('callbackUrl', encodeURI(pathname));
        return NextResponse.redirect(url);
    }

    if (isAuthPath && token) {
        // Redirect to dashboard if trying to access auth pages while already authenticated
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure matcher for the middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
};