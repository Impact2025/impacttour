import { db } from '@/lib/db'
import { gameSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/webhook
 * Verwerk Stripe betaling bevestiging
 */
export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Geen signature' }, { status: 400 })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Stripe webhook] Verificatie mislukt:', err)
    return NextResponse.json({ error: 'Webhook verificatie mislukt' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session
    const gameSessionId = checkoutSession.metadata?.gameSessionId

    if (gameSessionId) {
      await db
        .update(gameSessions)
        .set({ paidAt: new Date() })
        .where(eq(gameSessions.id, gameSessionId))

      console.log(`[Stripe] Betaling bevestigd voor sessie ${gameSessionId}`)
    }
  }

  return NextResponse.json({ received: true })
}
