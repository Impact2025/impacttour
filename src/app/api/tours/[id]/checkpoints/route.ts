import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createCheckpointSchema = z.object({
  orderIndex: z.number().int().min(0),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['kennismaking', 'samenwerking', 'reflectie', 'actie', 'feest']).default('samenwerking'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  unlockRadiusMeters: z.number().int().min(10).max(500).default(50),
  missionTitle: z.string().min(1).max(200),
  missionDescription: z.string().min(1).max(2000),
  missionType: z.enum(['opdracht', 'foto', 'quiz', 'video']).default('opdracht'),
  gmsConnection: z.number().int().min(0).max(25).default(0),
  gmsMeaning: z.number().int().min(0).max(25).default(0),
  gmsJoy: z.number().int().min(0).max(25).default(0),
  gmsGrowth: z.number().int().min(0).max(25).default(0),
  hint1: z.string().max(300).optional(),
  hint2: z.string().max(300).optional(),
  hint3: z.string().max(300).optional(),
  isKidsFriendly: z.boolean().default(true),
  timeLimitSeconds: z.number().int().min(60).max(3600).nullable().optional(),
  bonusPhotoPoints: z.number().int().min(0).max(500).default(0),
})

/** POST /api/tours/[id]/checkpoints — Checkpoint toevoegen */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id: tourId } = await params

  // Verifieer eigenaarschap
  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, tourId), eq(tours.createdById, session.user.id)),
  })
  if (!tour) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  const body = await req.json()
  const parsed = createCheckpointSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens', details: parsed.error.flatten() }, { status: 400 })
  }

  const [checkpoint] = await db
    .insert(checkpoints)
    .values({ ...parsed.data, tourId })
    .returning()

  return NextResponse.json(checkpoint, { status: 201 })
}
