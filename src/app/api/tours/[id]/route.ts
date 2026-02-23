import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateTourSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  variant: z.enum(['wijktocht', 'impactsprint', 'familietocht', 'jeugdtocht', 'voetbalmissie']).optional(),
  estimatedDurationMin: z.number().int().min(30).max(480).optional(),
  maxTeams: z.number().int().min(1).max(100).optional(),
  priceInCents: z.number().int().min(0).optional(),
  pricingModel: z.enum(['flat', 'per_person']).optional(),
  pricePerPersonCents: z.number().int().min(0).optional(),
  storyFrame: z.object({ introText: z.string(), finaleReveal: z.string() }).nullable().optional(),
  isPublished: z.boolean().optional(),
})

/** GET /api/tours/[id] — Haal tocht op met checkpoints */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params

  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, id), eq(tours.createdById, session.user.id)),
    with: { checkpoints: { orderBy: (c, { asc }) => [asc(c.orderIndex)] } },
  })

  if (!tour) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  return NextResponse.json(tour)
}

/** PUT /api/tours/[id] — Tocht bijwerken */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateTourSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens', details: parsed.error.flatten() }, { status: 400 })
  }

  const [updated] = await db
    .update(tours)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(tours.id, id), eq(tours.createdById, session.user.id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  return NextResponse.json(updated)
}

/** DELETE /api/tours/[id] — Tocht verwijderen */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params

  const [deleted] = await db
    .delete(tours)
    .where(and(eq(tours.id, id), eq(tours.createdById, session.user.id)))
    .returning()

  if (!deleted) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  return NextResponse.json({ success: true })
}
