import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware for Mwijay Services.
 * Handles: Admin Protection & Hardened CSP for Google Auth & Spline 3D.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ADMIN PROTECTION LOGIC
  const isAdminPath = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  
  if (isAdminPath) {
    const authToken = request.cookies.get('firebase_auth_token')?.value;
    const adminSession = request.cookies.get('admin_session')?.value;

    if (!authToken && !adminSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 2. SECURITY HEADERS
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Hardened CSP: Optimized for Google Auth, Firebase, and Spline 3D (wasm/code)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://*.firebaseio.com https://*.googleapis.com https://prod.spline.design https://*.spline.design https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' https://res.cloudinary.com https://*.googleusercontent.com https://images.unsplash.com https://picsum.photos data: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://unpkg.com https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.cloudinary.com wss://*.firebaseio.com https://prod.spline.design https://*.spline.design;
    frame-src 'self' https://prod.spline.design https://*.spline.design https://*.firebaseapp.com https://accounts.google.com;
    media-src 'self' https://res.cloudinary.com blob:;
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
