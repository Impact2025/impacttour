import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq, asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { tourId } = await params

  const [tour] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1)
  if (!tour) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const cps = await db
    .select()
    .from(checkpoints)
    .where(eq(checkpoints.tourId, tourId))
    .orderBy(asc(checkpoints.orderIndex))

  return NextResponse.json({ tour, checkpoints: cps })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { tourId } = await params
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Ongeldige data' }, { status: 400 })

  const [existing] = await db.select({ id: tours.id }).from(tours).where(eq(tours.id, tourId)).limit(1)
  if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const {
    name, description, variant, estimatedDurationMin, maxTeams,
    priceInCents, pricingModel, pricePerPersonCents, storyFrame,
  } = body as Record<string, unknown>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = { updatedAt: new Date() }
  if (name !== undefined) patch.name = String(name)
  if (description !== undefined) patch.description = description ? String(description) : null
  if (variant !== undefined) patch.variant = variant
  if (estimatedDurationMin !== undefined) patch.estimatedDurationMin = Number(estimatedDurationMin) || null
  if (maxTeams !== undefined) patch.maxTeams = Number(maxTeams) || null
  if (priceInCents !== undefined) patch.priceInCents = Number(priceInCents) || 0
  if (pricingModel !== undefined) patch.pricingModel = String(pricingModel)
  if (pricePerPersonCents !== undefined) patch.pricePerPersonCents = Number(pricePerPersonCents) || 0
  if (storyFrame !== undefined) patch.storyFrame = storyFrame

  await db.update(tours).set(patch).where(eq(tours.id, tourId))
  const [updated] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1)
  return NextResponse.json({ tour: updated })
}
