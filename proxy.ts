import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicPaths = ['/login', '/auth/callback', '/', '/posts', '/api/auth/set-session'];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Proxy API requests to the backend and attach Authorization header
  if (pathname.startsWith('/api/v1/')) {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const backendUrl = new URL(pathname, backendBase);
    backendUrl.search = request.nextUrl.search;
    
    const requestHeaders = new Headers(request.headers);
    // Fix host header to match the backend
    requestHeaders.set('host', new URL(backendBase).host);
    requestHeaders.delete('connection');
    
    const authCookie = request.cookies.get('accessToken');
    if (authCookie) {
      requestHeaders.set('Authorization', `Bearer ${authCookie.value}`);
    }
    
    // We use a manual fetch instead of NextResponse.rewrite because external 
    // rewrites (different port) strip Authorization headers by default.
    const res = await fetch(backendUrl.toString(), {
      method: request.method,
      headers: requestHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      // @ts-expect-error duplex is required for Request with stream body in Node
      duplex: 'half',
      redirect: 'manual',
    });

    // Read response as ArrayBuffer to avoid streaming issues
    const body = await res.arrayBuffer();
    
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');

    return new NextResponse(body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  }

  // Intercept auth callback to route through the set-session API
  // This uses a Route Handler to reliably set httpOnly cookies
  if (pathname === '/auth/callback' && searchParams.has('accessToken')) {
    const setSessionUrl = new URL('/api/auth/set-session', request.url);
    setSessionUrl.searchParams.set('accessToken', searchParams.get('accessToken')!);
    const refreshToken = searchParams.get('refreshToken');
    if (refreshToken) {
      setSessionUrl.searchParams.set('refreshToken', refreshToken);
    }
    return NextResponse.redirect(setSessionUrl);
  }

  // Skip public routes
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Check for auth cookie - the actual cookie name depends on the backend
  // The backend sets an httpOnly cookie; we can check for its existence
  const authCookie = request.cookies.get('accessToken') || request.cookies.get('token');

  if (!authCookie) {
    // Not authenticated — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access is enforced client-side via RoleGuard
  // since we can't decode the JWT server-side without the secret

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
