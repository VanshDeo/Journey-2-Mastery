import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/set-session?accessToken=...&refreshToken=...
 * 
 * This Route Handler receives tokens from the OAuth callback,
 * stores them as httpOnly cookies, and redirects to /auth/callback.
 * 
 * Using a Route Handler instead of the proxy for cookie-setting
 * because proxy redirect responses may not reliably persist Set-Cookie
 * headers in Next.js 16's proxy.ts.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  const callbackUrl = new URL('/auth/callback', request.url);
  const response = NextResponse.redirect(callbackUrl, 302);

  if (accessToken) {
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false, // localhost
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  if (refreshToken) {
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false, // localhost
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return response;
}
