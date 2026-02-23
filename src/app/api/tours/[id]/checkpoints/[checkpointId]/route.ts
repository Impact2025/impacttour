import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateCheckpointSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  type: z.enum(['kennismaking', 'samenwerking', 'reflectie', 'actie', 'feest']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  unlockRadiusMeters: z.number().int().min(10).max(500).optional(),
  missionTitle: z.string().min(1).max(200).optional(),
  missionDescription: z.string().min(1).max(2000).optional(),
  missionType: z.enum(['opdracht', 'foto', 'quiz', 'video']).optional(),
  gmsConnection: z.number().int().min(0).max(25).optional(),
  gmsMeaning: z.number().int().min(0).max(25).optional(),
  gmsJoy: z.number().int().min(0).max(25).optional(),
  gmsGrowth: z.number().int().min(0).max(25).optional(),
  hint1: z.string().max(300).nullable().optional(),
  hint2: z.string().max(300).nullable().optional(),
  hint3: z.string().max(300).nullable().optional(),
  isKidsFriendly: z.boolean().optional(),
  orderIndex: z.number().int().min(0).optional(),
  timeLimitSeconds: z.number().int().min(60).max(3600).nullable().optional(),
  bonusPhotoPoints: z.number().int().min(0).max(500).optional(),
})

/** PUT /api/tours/[id]/checkpoints/[checkpointId] — Checkpoint bijwerken */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; checkpointId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id: tourId, checkpointId } = await params

  // Verifieer eigenaarschap van tocht
  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, tourId), eq(tours.createdById, session.user.id)),
  })
  if (!tour) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  const body = await req.json()
  const parsed = updateCheckpointSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens', details: parsed.error.flatten() }, { status: 400 })
  }

  const [updated] = await db
    .update(checkpoints)
    .set(parsed.data)
    .where(and(eq(checkpoints.id, checkpointId), eq(checkpoints.tourId, tourId)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Checkpoint niet gevonden' }, { status: 404 })

  return NextResponse.json(updated)
}

/** DELETE /api/tours/[id]/checkpoints/[checkpointId] — Checkpoint verwijderen */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; checkpointId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id: tourId, checkpointId } = await params

  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, tourId), eq(tours.createdById, session.user.id)),
  })
  if (!tour) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  const [deleted] = await db
    .delete(checkpoints)
    .where(and(eq(checkpoints.id, checkpointId), eq(checkpoints.tourId, tourId)))
    .returning()

  if (!deleted) return NextResponse.json({ error: 'Checkpoint niet gevonden' }, { status: 404 })

  return NextResponse.json({ success: true })
}
