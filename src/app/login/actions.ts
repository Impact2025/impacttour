'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyPassword } from '@/lib/auth/password'
import { createUserSession, safeCallbackUrl } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'

const GENERIC_ERROR = 'Onbekend e-mailadres of onjuist wachtwoord.'

/**
 * Wachtwoord-login voor spelleiders en marketplace-klanten.
 *
 * Vervangt `signIn('customer-credentials')` — die met de database-session
 * strategie geen sessie aanmaakt. Verifieert de scrypt-hash uit `users.password`
 * en maakt zelf een DB-sessie aan. Bij succes: redirect naar `callbackUrl`.
 *
 * @returns `{ error }` bij mislukking; redirect (gooit) bij succes.
 */
export async function passwordLoginAction(
  email: string,
  password: string,
  callbackUrl: string
): Promise<{ error: string } | void> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !password) return { error: 'Vul e-mailadres en wachtwoord in.' }

  // Rate limit: max 10 pogingen per IP per minuut (Redis in productie, in-memory lokaal)
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!(await checkRateLimit(`login:${ip}`, 10, 60_000))) {
    return { error: 'Te veel inlogpogingen. Wacht een minuut en probeer het opnieuw.' }
  }

  const [user] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1)
  if (!user || !user.password) return { error: GENERIC_ERROR }

  if (!verifyPassword(password, user.password)) return { error: GENERIC_ERROR }

  await createUserSession(user.id)

  const target = safeCallbackUrl(
    callbackUrl,
    user.role === 'admin' ? '/admin/dashboard' : '/spelleider/dashboard'
  )
  redirect(target)
}
