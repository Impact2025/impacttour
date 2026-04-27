import { NextRequest, NextResponse } from 'next/server'

// Geen NextAuth import — vermijdt nodemailer edge-runtime crash.
// Rol-verificatie gebeurt server-side in layouts/pages via auth().
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const hasSession =
    req.cookies.has('authjs.session-token') ||
    req.cookies.has('__Secure-authjs.session-token')

  // Spelleider & klant routes → /login met callbackUrl (relatief pad, voorkomt open redirect)
  if (pathname.startsWith('/spelleider') || pathname.startsWith('/klant')) {
    if (!hasSession) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Admin routes → /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/spelleider/:path*', '/admin/:path*', '/klant/:path*'],
}
