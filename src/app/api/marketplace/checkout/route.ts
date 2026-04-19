import { db } from '@/lib/db'
import { users, tours, gameSessions, coupons, orders } from '@/lib/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateJoinCode } from '@/lib/utils'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { generateMagicLink } from '@/lib/auth/magic-link'
import { hashPassword, generatePassword } from '@/lib/auth/password'
import { z } from 'zod'
import Stripe from 'stripe'

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
 * 1. Maak/vind gebruiker
 * 2. Maak gameSession aan
 * 3. Valideer coupon + maak order aan
 * 4. Gratis → magic link sturen; betaald → Stripe Checkout URL retourneren
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

  const reqUrl = new URL(req.url)
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || `${reqUrl.protocol}//${reqUrl.host}`).trim().replace(/\/$/, '')

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
  let plainPassword: string | null = null

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

  // ── Magic link helper ────────────────────────────────────────────────────
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

  // ── Betaald: Stripe Checkout sessie aanmaken ─────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Betalingsprovider niet geconfigureerd' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const successUrl = `${appUrl}/klant/${gameSession.id}/setup?betaald=1`
  const cancelUrl = `${appUrl}/tochten/${tourId}?geannuleerd=1`
  console.log('[marketplace-checkout] appUrl:', appUrl, '| successUrl:', successUrl)

  let checkout: Stripe.Checkout.Session
  try {
    checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: tour.name,
            description: `${tour.variant} — ${tour.estimatedDurationMin ?? 120} min${organizationName ? ` · ${organizationName}` : ''}`,
          },
          unit_amount: finalAmountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      source: 'marketplace',
      orderId: order.id,
      sessionId: gameSession.id,
      userId: user.id,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
  } catch (err) {
    console.error('[marketplace-checkout] Stripe fout:', err)
    return NextResponse.json(
      { error: 'Betalingsprovider fout', details: err instanceof Error ? err.message : String(err), successUrl, cancelUrl },
      { status: 502 }
    )
  }

  // Stripe session ID opslaan
  await db.update(orders)
    .set({ stripeSessionId: checkout.id })
    .where(eq(orders.id, order.id))

  return NextResponse.json({
    success: true,
    free: false,
    paymentUrl: checkout.url,
    sessionId: gameSession.id,
  })
}
