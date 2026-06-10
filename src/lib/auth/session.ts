/**
 * Database-sessie helper voor Credentials-logins.
 *
 * NextAuth v5 (beta) maakt met `strategy: 'database'` GEEN sessie aan voor
 * Credentials-providers — alleen voor OAuth/magic-link. We maken de sessie
 * daarom zelf aan in dezelfde tabel + cookie die `auth()` leest, zodat
 * wachtwoord-logins (admin, spelleider, klant) een geldige sessie krijgen.
 */
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 dagen

/** Cookie-naam die NextAuth gebruikt (Secure-prefix in productie). */
export function sessionCookieName(): string {
  return process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'
}

/**
 * Maak een database-sessie aan voor `userId` en zet de sessie-cookie.
 * Identiek aan wat de DrizzleAdapter doet voor OAuth/magic-link logins.
 */
export async function createUserSession(userId: string): Promise<void> {
  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS)

  await db.insert(sessions).values({ sessionToken, userId, expires })

  const cookieStore = await cookies()
  cookieStore.set(sessionCookieName(), sessionToken, {
    expires,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

/**
 * Veilige callbackUrl: alleen relatieve paden binnen de app toestaan
 * (voorkomt open-redirect via `//evil.com` of absolute URL's).
 */
export function safeCallbackUrl(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  return raw
}
