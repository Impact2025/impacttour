import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { checkpoints } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq, asc, and, gt } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ checkpointId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { checkpointId } = await params
  const [cp] = await db.select().from(checkpoints).where(eq(checkpoints.id, checkpointId)).limit(1)
  if (!cp) return NextResponse.json({ error: 'Checkpoint niet gevonden' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Ongeldige data' }, { status: 400 })

  const { action } = body as Record<string, unknown>

  // Reorder actions
  if (action === 'move_up' || action === 'move_down') {
    const direction = action === 'move_up' ? 'up' : 'down'
    const siblings = await db
      .select({ id: checkpoints.id, orderIndex: checkpoints.orderIndex })
      .from(checkpoints)
      .where(eq(checkpoints.tourId, cp.tourId))
      .orderBy(asc(checkpoints.orderIndex))

    const idx = siblings.findIndex(s => s.id === checkpointId)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      return NextResponse.json({ error: 'Kan niet verder verplaatsen' }, { status: 400 })
    }
    const swapWith = siblings[swapIdx]
    await db.update(checkpoints).set({ orderIndex: swapWith.orderIndex }).where(eq(checkpoints.id, checkpointId))
    await db.update(checkpoints).set({ orderIndex: cp.orderIndex }).where(eq(checkpoints.id, swapWith.id))

    const updated = await db
      .select()
      .from(checkpoints)
      .where(eq(checkpoints.tourId, cp.tourId))
      .orderBy(asc(checkpoints.orderIndex))
    return NextResponse.json({ checkpoints: updated })
  }

  // Field update
  const {
    name, description, type, latitude, longitude, unlockRadiusMeters,
    missionTitle, missionDescription, missionType, navigationHint,
    gmsConnection, gmsMeaning, gmsJoy, gmsGrowth,
    hint1, hint2, hint3, timeLimitSeconds, bonusPhotoPoints, isKidsFriendly,
  } = body as Record<string, unknown>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {}
  if (name !== undefined) patch.name = String(name)
  if (description !== undefined) patch.description = description ? String(description) : null
  if (type !== undefined) patch.type = type
  if (latitude !== undefined) patch.latitude = Number(latitude)
  if (longitude !== undefined) patch.longitude = Number(longitude)
  if (unlockRadiusMeters !== undefined) patch.unlockRadiusMeters = Math.max(10, Number(unlockRadiusMeters))
  if (missionTitle !== undefined) patch.missionTitle = String(missionTitle)
  if (missionDescription !== undefined) patch.missionDescription = String(missionDescription)
  if (missionType !== undefined) patch.missionType = String(missionType)
  if (navigationHint !== undefined) patch.navigationHint = navigationHint ? String(navigationHint) : null
  if (gmsConnection !== undefined) patch.gmsConnection = Math.min(25, Math.max(0, Number(gmsConnection)))
  if (gmsMeaning !== undefined) patch.gmsMeaning = Math.min(25, Math.max(0, Number(gmsMeaning)))
  if (gmsJoy !== undefined) patch.gmsJoy = Math.min(25, Math.max(0, Number(gmsJoy)))
  if (gmsGrowth !== undefined) patch.gmsGrowth = Math.min(25, Math.max(0, Number(gmsGrowth)))
  if (hint1 !== undefined) patch.hint1 = hint1 ? String(hint1) : null
  if (hint2 !== undefined) patch.hint2 = hint2 ? String(hint2) : null
  if (hint3 !== undefined) patch.hint3 = hint3 ? String(hint3) : null
  if (timeLimitSeconds !== undefined) patch.timeLimitSeconds = timeLimitSeconds ? Number(timeLimitSeconds) : null
  if (bonusPhotoPoints !== undefined) patch.bonusPhotoPoints = Math.max(0, Number(bonusPhotoPoints))
  if (isKidsFriendly !== undefined) patch.isKidsFriendly = Boolean(isKidsFriendly)

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Geen velden' }, { status: 400 })

  await db.update(checkpoints).set(patch).where(eq(checkpoints.id, checkpointId))
  const [updated] = await db.select().from(checkpoints).where(eq(checkpoints.id, checkpointId)).limit(1)
  return NextResponse.json({ checkpoint: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ checkpointId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { checkpointId } = await params
  const [cp] = await db.select().from(checkpoints).where(eq(checkpoints.id, checkpointId)).limit(1)
  if (!cp) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  await db.delete(checkpoints).where(eq(checkpoints.id, checkpointId))

  // Re-number remaining checkpoints
  const remaining = await db
    .select({ id: checkpoints.id })
    .from(checkpoints)
    .where(and(eq(checkpoints.tourId, cp.tourId), gt(checkpoints.orderIndex, cp.orderIndex)))
    .orderBy(asc(checkpoints.orderIndex))

  for (let i = 0; i < remaining.length; i++) {
    await db.update(checkpoints)
      .set({ orderIndex: cp.orderIndex + i })
      .where(eq(checkpoints.id, remaining[i].id))
  }

  const updated = await db
    .select()
    .from(checkpoints)
    .where(eq(checkpoints.tourId, cp.tourId))
    .orderBy(asc(checkpoints.orderIndex))

  return NextResponse.json({ checkpoints: updated })
}
