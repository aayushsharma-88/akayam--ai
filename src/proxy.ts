/**
 * AKAYAM AI — Next.js Middleware
 * Protects routes that require authentication.
 */


import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/test-chat',
]

export default function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl
  
  // Fast edge check for session cookie
  const hasSession = req.cookies.has('authjs.session-token') || req.cookies.has('__Secure-authjs.session-token')
  const isAuthenticated = hasSession

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/')
  )
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route =>
    nextUrl.pathname.startsWith(route)
  )
  const isApiRoute = nextUrl.pathname.startsWith('/api/')

  // Always allow public API routes (auth callbacks etc.)
  if (isPublicApiRoute) return NextResponse.next()

  // Protect API routes
  if (isApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be signed in.' },
      { status: 401 }
    )
  }

  // If authenticated and trying to access login/register, redirect to app
  if (isAuthenticated && isPublicRoute) {
    // We do NOT redirect here to prevent infinite redirect loops if the cookie is invalid.
    // The client or server components should handle authenticated redirects if needed.
    // return NextResponse.redirect(new URL('/', nextUrl))
  }

  // If not authenticated and accessing a protected route
  if (!isAuthenticated && !isPublicRoute && !isApiRoute) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    loginUrl.searchParams.set('clear', '1') // Cache buster for ERR_TOO_MANY_REDIRECTS
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
}
