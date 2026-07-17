import { NextRequest, NextResponse } from 'next/server'

// Geen NextAuth import — vermijdt nodemailer edge-runtime crash.
// Rol-verificatie gebeurt server-side in layouts/pages via auth().
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''
  const baseHost = host.split(':')[0]

  // ── WWW → non-www redirect ─────────────────────────────────
  if (baseHost.startsWith('www.') && baseHost.endsWith('ictusgo.nl')) {
    const url = req.nextUrl.clone()
    url.host = 'ictusgo.nl'
    return NextResponse.redirect(url, 301)
  }

  // ── Jaar-alias → kanonieke Dankdag-LP (SEO: geen duplicate content) ──
  if (pathname === '/vrijwilligers-dankdag-2026') {
    return NextResponse.redirect(new URL('/impact-vrijwilligers-dankdag', req.url), 301)
  }

  // Rest alleen checken voor beschermde routes
  if (
    !pathname.startsWith('/spelleider') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/klant')
  ) {
    return NextResponse.next()
  }

  const hasSession =
    req.cookies.has('authjs.session-token') ||
    req.cookies.has('__Secure-authjs.session-token')

  // Spelleider & klant routes → /login met callbackUrl
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
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    '/spelleider/:path*',
    '/admin/:path*',
    '/klant/:path*',
  ],
}
