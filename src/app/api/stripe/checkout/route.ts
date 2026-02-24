import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, gameSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { generateJoinCode } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  tourId: z.string().uuid(),
  scheduledAt: z.string().optional(),
  participantCount: z.number().int().min(1).max(200).optional(),
})

/**
 * POST /api/stripe/checkout
 * Maak Stripe Checkout sessie aan voor een betaalde tocht
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { tourId, scheduledAt, participantCount } = parsed.data

  // Haal tocht op
  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, tourId), eq(tours.createdById, session.user.id)),
  })

  if (!tour) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  // Per-persoon pricing: bereken totaalprijs
  const effectivePriceCents =
    tour.pricingModel === 'per_person' && participantCount && tour.pricePerPersonCents > 0
      ? tour.pricePerPersonCents * participantCount
      : (tour.priceInCents ?? 0)

  // Gratis tocht: direct sessie aanmaken
  if (effectivePriceCents === 0) {
    const joinCode = generateJoinCode()
    const [gameSession] = await db
      .insert(gameSessions)
      .values({
        tourId,
        spelleIderId: session.user.id,
        status: 'draft',
        joinCode,
        variant: tour.variant,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        paidAt: new Date(), // gratis = direct betaald
      })
      .returning()

    return NextResponse.json({
      sessionId: gameSession.id,
      joinCode,
      paid: true,
    })
  }

  // Betaalde tocht: Stripe Checkout
  const joinCode = generateJoinCode()

  // Maak eerst draft sessie aan
  const [gameSession] = await db
    .insert(gameSessions)
    .values({
      tourId,
      spelleIderId: session.user.id,
      status: 'draft',
      joinCode,
      variant: tour.variant,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    })
    .returning()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: tour.name,
            description: tour.pricingModel === 'per_person' && participantCount
              ? `IctusGo sessie - ${tour.variant} (${participantCount} deelnemers)`
              : `IctusGo sessie - ${tour.variant}`,
          },
          unit_amount: effectivePriceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      gameSessionId: gameSession.id,
      spelleIderId: session.user.id,
    },
    success_url: `${appUrl}/spelleider/sessies/${gameSession.id}?betaald=1`,
    cancel_url: `${appUrl}/spelleider/tochten/${tourId}`,
  })

  // Sla Stripe session ID op
  await db
    .update(gameSessions)
    .set({ stripeSessionId: checkout.id })
    .where(eq(gameSessions.id, gameSession.id))

  return NextResponse.json({ checkoutUrl: checkout.url })
}
