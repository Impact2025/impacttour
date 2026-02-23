import { db } from '@/lib/db'
import { users, tours, gameSessions, coupons, orders } from '@/lib/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateJoinCode } from '@/lib/utils'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { generateMagicLink } from '@/lib/auth/magic-link'
import { hashPassword, generatePassword } from '@/lib/auth/password'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  tourId: z.string().uuid(),
  scheduledAt: z.string().optional(),
  participantCount: z.number().int().min(1).max(500).optional(),
  teamCount: z.number().int().min(1).max(50).default(1),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email(),
  organizationName: z.string().max(120).optional(),
  couponCode: z.string().max(50).optional(),
})

/**
 * POST /api/marketplace/checkout
 * Verwerkt een marketplace-boeking:
 * 1. Maak/vind gebruiker
 * 2. Maak gameSessions aan
 * 3. Coupon valideren + order aanmaken
 * 4. Gratis → magic link sturen, betaald → MultiSafepay redirect URL retourneren
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens', details: parsed.error.flatten() }, { status: 400 })
  }

  const {
    tourId, scheduledAt, participantCount, teamCount,
    firstName, lastName, email, organizationName, couponCode,
  } = parsed.data

  const fullName = `${firstName} ${lastName}`

  // Gebruik de origin van de inkomende request (werkt voor elke poort/domein)
  const reqUrl = new URL(req.url)
  const appUrl = `${reqUrl.protocol}//${reqUrl.host}`

  // ── Tocht ophalen ────────────────────────────────────────────────────────
  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, tourId), eq(tours.isPublished, true)),
  })
  if (!tour) {
    return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })
  }

  // ── Prijs berekenen ──────────────────────────────────────────────────────
  const originalAmountCents =
    tour.pricingModel === 'per_person' && participantCount && tour.pricePerPersonCents > 0
      ? tour.pricePerPersonCents * participantCount
      : (tour.priceInCents ?? 0)

  let finalAmountCents = originalAmountCents
  let appliedCoupon: typeof coupons.$inferSelect | null = null

  // ── Coupon valideren ─────────────────────────────────────────────────────
  if (couponCode) {
    const code = couponCode.toUpperCase().trim()
    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code),
        or(isNull(coupons.tourId), eq(coupons.tourId, tourId))
      ),
    })

    if (coupon) {
      const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
      const isExhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses

      if (!isExpired && !isExhausted) {
        appliedCoupon = coupon
        if (coupon.discountType === 'free') {
          finalAmountCents = 0
        } else if (coupon.discountType === 'percent') {
          finalAmountCents = Math.max(0, originalAmountCents - Math.round(originalAmountCents * (coupon.discountValue / 100)))
        } else if (coupon.discountType === 'fixed') {
          finalAmountCents = Math.max(0, originalAmountCents - coupon.discountValue)
        }
      }
    }
  }

  // ── Gebruiker aanmaken of vinden ─────────────────────────────────────────
  let user = await db.query.users.findFirst({ where: eq(users.email, email) })
  let plainPassword: string | null = null // alleen gevuld voor nieuwe gebruikers

  if (!user) {
    plainPassword = generatePassword()
    const [newUser] = await db.insert(users).values({
      email,
      name: fullName,
      organizationName: organizationName || null,
      role: 'spelleider',
      password: hashPassword(plainPassword),
    }).returning()
    user = newUser
  } else {
    // Update naam/org als ze er nog niet staan
    if (!user.name || !user.organizationName) {
      await db.update(users)
        .set({
          name: user.name || fullName,
          organizationName: user.organizationName || organizationName || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
    }
  }

  // ── Game sessie aanmaken ─────────────────────────────────────────────────
  const joinCode = generateJoinCode()
  const [gameSession] = await db.insert(gameSessions).values({
    tourId,
    spelleIderId: user.id,
    status: 'draft',
    joinCode,
    variant: tour.variant,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    organizationName: organizationName || user.organizationName || null,
    source: 'marketplace',
    paidAt: finalAmountCents === 0 ? new Date() : null,
  }).returning()

  // ── Coupon gebruik bijhouden ─────────────────────────────────────────────
  if (appliedCoupon) {
    await db.update(coupons)
      .set({ usedCount: appliedCoupon.usedCount + 1 })
      .where(eq(coupons.code, appliedCoupon.code))
  }

  // ── Order aanmaken ───────────────────────────────────────────────────────
  const [order] = await db.insert(orders).values({
    userId: user.id,
    sessionId: gameSession.id,
    tourId,
    couponCode: appliedCoupon?.code || null,
    amountCents: finalAmountCents,
    originalAmountCents,
    participantCount: participantCount || teamCount,
    status: finalAmountCents === 0 ? 'free' : 'pending',
    organizationName: organizationName || null,
    customerName: fullName,
    customerEmail: email,
  }).returning()

  // ── Magic link genereren ─────────────────────────────────────────────────
  const sendMagicLink = async (sessionId: string) => {
    const magicLink = await generateMagicLink({
      email,
      callbackPath: `/klant/${sessionId}/setup`,
      appUrl,
    })

    await sendBookingConfirmationEmail({
      to: email,
      customerName: firstName,
      tourName: tour.name,
      setupUrl: magicLink,
      loginUrl: `${appUrl}/login`,
      isPaid: finalAmountCents > 0,
      amountFormatted: finalAmountCents > 0 ? `€${(finalAmountCents / 100).toFixed(2)}` : undefined,
      accountEmail: email,
      credentials: plainPassword ? { email, password: plainPassword } : undefined,
    })
  }

  // ── Gratis: direct magic link sturen ────────────────────────────────────
  if (finalAmountCents === 0) {
    await sendMagicLink(gameSession.id)

    return NextResponse.json({
      success: true,
      free: true,
      sessionId: gameSession.id,
      message: 'Check je e-mail voor de link naar je tocht!',
    })
  }

  // ── Betaald: MultiSafepay order aanmaken ─────────────────────────────────
  const mspApiKey = process.env.MULTISAFEPAY_API_KEY!
  const mspBaseUrl = process.env.MULTISAFEPAY_TEST === 'true'
    ? 'https://testapi.multisafepay.com/v1/json'
    : 'https://api.multisafepay.com/v1/json'

  const mspOrderId = `IT-${order.id.replace(/-/g, '').slice(0, 16).toUpperCase()}`

  const mspPayload = {
    type: 'redirect',
    order_id: mspOrderId,
    gateway: '',
    currency: 'EUR',
    amount: finalAmountCents,
    description: `ImpactTocht — ${tour.name}${organizationName ? ` (${organizationName})` : ''}`,
    payment_options: {
      notification_url: `${appUrl}/api/multisafepay/webhook`,
      redirect_url: `${appUrl}/klant/${gameSession.id}/setup?betaald=1`,
      cancel_url: `${appUrl}/tochten/${tourId}?geannuleerd=1`,
    },
    customer: {
      email,
      first_name: firstName,
      last_name: lastName,
      locale: 'nl_NL',
    },
    order_data: {
      items: [
        {
          name: tour.name,
          description: `${tour.variant} — ${tour.estimatedDurationMin ?? 120} min`,
          unit_price: originalAmountCents,
          quantity: 1,
        },
      ],
    },
  }

  const mspRes = await fetch(`${mspBaseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api_key': mspApiKey,
    },
    body: JSON.stringify(mspPayload),
  })

  const mspData = await mspRes.json()

  if (!mspData.success) {
    console.error('MultiSafepay fout:', mspData)
    return NextResponse.json({ error: 'Betalingsprovider onbeschikbaar. Probeer het later opnieuw.' }, { status: 502 })
  }

  // Sla MSP order ID op
  await db.update(gameSessions)
    .set({ mspOrderId })
    .where(eq(gameSessions.id, gameSession.id))

  await db.update(orders)
    .set({ mspOrderId })
    .where(eq(orders.id, order.id))

  return NextResponse.json({
    success: true,
    free: false,
    paymentUrl: mspData.data.payment_url,
    sessionId: gameSession.id,
  })
}
