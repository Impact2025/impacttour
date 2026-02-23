import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createTourSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  variant: z.enum(['wijktocht', 'impactsprint', 'familietocht', 'jeugdtocht', 'voetbalmissie']).default('wijktocht'),
  estimatedDurationMin: z.number().int().min(30).max(480).default(120),
  maxTeams: z.number().int().min(1).max(100).default(20),
  priceInCents: z.number().int().min(0).default(0),
  pricingModel: z.enum(['flat', 'per_person']).default('flat'),
  pricePerPersonCents: z.number().int().min(0).default(0),
  storyFrame: z.object({
    introText: z.string(),
    finaleReveal: z.string(),
  }).optional(),
})

/** GET /api/tours — Haal alle tochten op van ingelogde spelleider */
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const userTours = await db
    .select()
    .from(tours)
    .where(eq(tours.createdById, session.user.id))
    .orderBy(desc(tours.createdAt))

  return NextResponse.json(userTours)
}

/** POST /api/tours — Nieuwe tocht aanmaken */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()
  const parsed = createTourSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens', details: parsed.error.flatten() }, { status: 400 })
  }

  const [tour] = await db
    .insert(tours)
    .values({ ...parsed.data, createdById: session.user.id })
    .returning()

  return NextResponse.json(tour, { status: 201 })
}
