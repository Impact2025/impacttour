import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, verificationTokens } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { sendMagicLinkEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const adminSession = await auth()
  if (!adminSession || adminSession.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { userId } = await params
  const body = await req.json().catch(() => ({}))

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })

  if (body.action === 'promote') {
    await db.update(users).set({ role: 'admin', updatedAt: new Date() }).where(eq(users.id, userId))
    return NextResponse.json({ success: true })
  }

  if (body.action === 'deactivate') {
    await db.update(users).set({ role: 'deactivated', updatedAt: new Date() }).where(eq(users.id, userId))
    return NextResponse.json({ success: true })
  }

  if (body.action === 'send_magic_link') {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    await db.insert(verificationTokens).values({
      identifier: user.email,
      token,
      expires,
    })

    const callbackUrl = `${baseUrl}/spelleider/dashboard`
    const url = `${baseUrl}/api/auth/callback/nodemailer?token=${token}&email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`

    await sendMagicLinkEmail({ to: user.email, url })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
}
