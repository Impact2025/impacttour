import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { checkpoints, tours } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq, max } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { tourId } = await params

  const [tour] = await db.select({ id: tours.id }).from(tours).where(eq(tours.id, tourId)).limit(1)
  if (!tour) return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })

  const [{ maxIndex }] = await db
    .select({ maxIndex: max(checkpoints.orderIndex) })
    .from(checkpoints)
    .where(eq(checkpoints.tourId, tourId))

  const nextIndex = (maxIndex ?? -1) + 1

  const body = await req.json().catch(() => ({})) as Record<string, unknown>

  const [created] = await db
    .insert(checkpoints)
    .values({
      tourId,
      orderIndex: nextIndex,
      name: String(body.name ?? `Checkpoint ${nextIndex + 1}`),
      description: body.description ? String(body.description) : null,
      type: (body.type as 'kennismaking' | 'samenwerking' | 'reflectie' | 'actie' | 'feest') ?? 'samenwerking',
      latitude: Number(body.latitude ?? 52.3702),
      longitude: Number(body.longitude ?? 4.8952),
      unlockRadiusMeters: Number(body.unlockRadiusMeters ?? 50),
      missionTitle: String(body.missionTitle ?? 'Missie omschrijving'),
      missionDescription: String(body.missionDescription ?? 'Beschrijf hier de opdracht voor het team.'),
      missionType: String(body.missionType ?? 'opdracht'),
      navigationHint: body.navigationHint ? String(body.navigationHint) : null,
      gmsConnection: Number(body.gmsConnection ?? 6),
      gmsMeaning: Number(body.gmsMeaning ?? 6),
      gmsJoy: Number(body.gmsJoy ?? 7),
      gmsGrowth: Number(body.gmsGrowth ?? 6),
      hint1: null,
      hint2: null,
      hint3: null,
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
      isKidsFriendly: true,
    })
    .returning()

  return NextResponse.json({ checkpoint: created }, { status: 201 })
}
