import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicPaths = ['/login', '/auth/callback', '/', '/posts', '/api/auth/set-session'];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ─── Skip all API routes ───
  // /api/v1/* is handled by the Hono catch-all route (app/api/v1/[[...route]]/route.ts).
  // /api/auth/* is handled by Next.js route handlers.
  // These have their own auth (Bearer token / middleware), so proxy must NOT interfere.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
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
