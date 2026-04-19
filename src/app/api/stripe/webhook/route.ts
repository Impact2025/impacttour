import { db } from '@/lib/db'
import { gameSessions, orders, users, tours, webhookEvents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { generateMagicLink } from '@/lib/auth/magic-link'
import { buildSpeelbareTocht } from '@/lib/tocht-builder'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/stripe/webhook
 * Centrale Stripe webhook voor alle betaalflows:
 *   - source='direct'       → spelleider directe boeking (paidAt op sessie)
 *   - source='marketplace'  → publieke marketplace boeking (order + sessie + magic link)
 *   - source='tocht-op-maat' → zelfservice tocht bouwen na betaling
 */
export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe niet geconfigureerd' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Geen signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] Verificatie mislukt:', err)
    return NextResponse.json({ error: 'Webhook verificatie mislukt' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const checkoutSession = event.data.object as Stripe.Checkout.Session
  const { source, orderId, sessionId: metaSessionId, gameSessionId } = checkoutSession.metadata ?? {}
  const stripeSessionId = checkoutSession.id

  const reqUrl = new URL(req.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${reqUrl.protocol}//${reqUrl.host}`

  // ── Deduplicatie via webhookEvents ──────────────────────────────────────
  const existing = await db.query.webhookEvents.findFirst({
    where: (t, { and, eq: eqFn }) =>
      and(eqFn(t.provider, 'stripe'), eqFn(t.eventId, event.id), eqFn(t.status, 'processed')),
  })
  if (existing) return NextResponse.json({ received: true })

  const [logEntry] = await db.insert(webhookEvents).values({
    provider: 'stripe',
    eventId: event.id,
    rawPayload: event as unknown as Record<string, unknown>,
    status: 'pending',
  }).returning()

  try {
    // ── Direct flow (spelleider boeking) ──────────────────────────────────
    const targetSessionId = metaSessionId ?? gameSessionId
    if ((!source || source === 'direct') && targetSessionId) {
      await db.update(gameSessions)
        .set({ paidAt: new Date() })
        .where(eq(gameSessions.id, targetSessionId))

      console.log(`[stripe] Direct betaling bevestigd voor sessie ${targetSessionId}`)
    }

    // ── Marketplace flow ──────────────────────────────────────────────────
    else if (source === 'marketplace' && orderId) {
      const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) })

      if (!order || order.status === 'paid') {
        await db.update(webhookEvents).set({ status: 'duplicate', processedAt: new Date() }).where(eq(webhookEvents.id, logEntry.id))
        return NextResponse.json({ received: true })
      }

      await db.update(orders).set({ status: 'paid', paidAt: new Date(), stripeSessionId }).where(eq(orders.id, orderId))

      if (order.sessionId) {
        await db.update(gameSessions).set({ paidAt: new Date() }).where(eq(gameSessions.id, order.sessionId))
      }

      const user = await db.query.users.findFirst({ where: eq(users.id, order.userId) })
      if (user && order.sessionId) {
        const tour = order.tourId ? await db.query.tours.findFirst({ where: eq(tours.id, order.tourId) }) : null
        const magicLink = await generateMagicLink({
          email: user.email,
          callbackPath: `/klant/${order.sessionId}/setup?betaald=1`,
          appUrl,
        })
        await sendBookingConfirmationEmail({
          to: user.email,
          customerName: (user.name || 'klant').split(' ')[0],
          tourName: tour?.name || 'ImpactTour',
          setupUrl: magicLink,
          loginUrl: `${appUrl}/login`,
          isPaid: true,
          amountFormatted: `€${(order.amountCents / 100).toFixed(2)}`,
          accountEmail: user.email,
        })
      }

      console.log(`[stripe] Marketplace betaling verwerkt voor order ${orderId}`)
    }

    // ── Tocht-op-maat flow ────────────────────────────────────────────────
    else if (source === 'tocht-op-maat' && orderId) {
      const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) })

      if (!order || order.status === 'paid') {
        await db.update(webhookEvents).set({ status: 'duplicate', processedAt: new Date() }).where(eq(webhookEvents.id, logEntry.id))
        return NextResponse.json({ received: true })
      }

      await db.update(orders).set({ status: 'paid', paidAt: new Date(), stripeSessionId }).where(eq(orders.id, orderId))
      await buildSpeelbareTocht(order, appUrl)

      console.log(`[stripe] Tocht-op-maat betaling verwerkt voor order ${orderId}`)
    }

    await db.update(webhookEvents).set({ status: 'processed', processedAt: new Date() }).where(eq(webhookEvents.id, logEntry.id))
    return NextResponse.json({ received: true })

  } catch (err) {
    await db.update(webhookEvents).set({
      status: 'failed',
      errorMessage: err instanceof Error ? err.message : String(err),
      processedAt: new Date(),
    }).where(eq(webhookEvents.id, logEntry.id))
    console.error('[stripe-webhook] Verwerking mislukt:', err)
    // Stripe verwacht 2xx — anders herprobeert het de webhook
    return NextResponse.json({ received: true })
  }
}
