import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware: geen NextAuth import (vermijdt nodemailer edge-runtime crash).
 * Auth-verificatie gebeurt in de server components zelf via auth() van @/lib/auth.
 * Hier alleen een basis cookie-check voor snelle redirect.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check of er een sessie-cookie aanwezig is (naam gebruikt door NextAuth v5)
  const hasSession =
    req.cookies.has('authjs.session-token') ||
    req.cookies.has('__Secure-authjs.session-token')

  if (pathname.startsWith('/spelleider') || (pathname.startsWith('/admin') && pathname !== '/admin/login')) {
    if (!hasSession) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/spelleider/:path*', '/admin/:path*'],
}
