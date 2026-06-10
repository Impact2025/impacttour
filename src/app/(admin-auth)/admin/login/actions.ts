'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyPassword } from '@/lib/auth/password'
import { createUserSession } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'

// NextAuth v5 beta maakt geen DB-sessies aan voor credentials providers.
// We verifiëren zelf en maken de sessie aan via createUserSession().
export async function adminLoginAction(_prevState: string, formData: FormData): Promise<string> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) return 'Vul e-mailadres en wachtwoord in.'

  // Rate limit / brute-force bescherming: max 5 pogingen per IP per 15 min
  // (Redis in productie via Upstash, in-memory fallback lokaal)
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!(await checkRateLimit(`admin-login:${ip}`, 5, 15 * 60_000))) {
    return 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.'
  }

  // 1. Zoek gebruiker op
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user || !user.password) return 'Onbekend e-mailadres of onjuist wachtwoord.'

  // 2. Verifieer wachtwoord
  if (!verifyPassword(password, user.password)) return 'Onbekend e-mailadres of onjuist wachtwoord.'

  // 3. Controleer admin rol
  if (user.role !== 'admin') return 'Je hebt geen admin-toegang.'

  // 4. Maak sessie aan (zelfde tabel + cookie die auth() leest)
  await createUserSession(user.id)

  redirect('/admin/dashboard')
}
