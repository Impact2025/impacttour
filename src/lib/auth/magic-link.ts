/**
 * Magic link generator voor marketplace checkout
 *
 * NextAuth v5 slaat tokens op als SHA-256(rawToken + AUTH_SECRET).
 * De URL bevat de raw token. Bij callback hasht NextAuth de raw token
 * en zoekt de hash op in verificationTokens.
 */
import { createHash, randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { verificationTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function generateMagicLink({
  email,
  callbackPath,
  appUrl,
}: {
  email: string
  callbackPath: string   // bijv. "/klant/abc123/setup"
  appUrl: string         // bijv. "http://localhost:7090"
}): Promise<string> {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET niet geconfigureerd')

  // 1. Genereer willekeurige raw token
  const rawToken = randomBytes(32).toString('hex')

  // 2. Hash zoals NextAuth v5 het verwacht: SHA-256(rawToken + AUTH_SECRET)
  const hashedToken = createHash('sha256')
    .update(`${rawToken}${secret}`)
    .digest('hex')

  // 3. Verwijder eventuele oude tokens voor dit e-mailadres (voorkom conflicten)
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, email))
    .catch(() => null)

  // 4. Sla de HASH op (niet de raw token) — NextAuth verwacht de hash in de DB
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 uur

  await db.insert(verificationTokens).values({
    identifier: email,
    token: hashedToken,
    expires,
  })

  // 5. Magic link URL met RAW token (NextAuth hasht dit bij ontvangst en vergelijkt met DB)
  const callbackUrl = encodeURIComponent(`${appUrl}${callbackPath}`)
  const magicLink = `${appUrl}/api/auth/callback/nodemailer?token=${rawToken}&email=${encodeURIComponent(email)}&callbackUrl=${callbackUrl}`

  return magicLink
}
