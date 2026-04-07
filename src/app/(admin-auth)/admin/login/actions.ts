'use server'

import { db } from '@/lib/db'
import { users, sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from '@/lib/auth/password'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'

// NextAuth v5 beta.29 maakt geen DB-sessies aan voor credentials providers.
// We maken de sessie zelf aan — zelfde tabel + cookie die auth() leest.
export async function adminLoginAction(_prevState: string, formData: FormData): Promise<string> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) return 'Vul e-mailadres en wachtwoord in.'

  // 1. Zoek gebruiker op
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const user = result[0]

  if (!user || !user.password) return 'Onbekend e-mailadres of onjuist wachtwoord.'

  // 2. Verifieer wachtwoord
  const valid = verifyPassword(password, user.password)
  if (!valid) return 'Onbekend e-mailadres of onjuist wachtwoord.'

  // 3. Controleer admin rol
  if (user.role !== 'admin') return 'Je hebt geen admin-toegang.'

  // 4. Maak sessie aan in DB (zelfde tabel als NextAuth gebruikt)
  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dagen

  await db.insert(sessions).values({ sessionToken, userId: user.id, expires })

  // 5. Zet sessie-cookie (zelfde naam als NextAuth leest)
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName = isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token'

  cookieStore.set(cookieName, sessionToken, {
    expires,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
  })

  redirect('/admin/dashboard')
}
