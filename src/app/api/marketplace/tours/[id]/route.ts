import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/marketplace/tours/[id]
 * Publieke tour-detail: checkpoint previews zonder GPS-coördinaten
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, id), eq(tours.isPublished, true)),
  })

  if (!tour) {
    return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })
  }

  // Checkpoints zonder GPS (publiek-veilig)
  const cps = await db
    .select({
      orderIndex: checkpoints.orderIndex,
      name: checkpoints.name,
      description: checkpoints.description,
      type: checkpoints.type,
      missionTitle: checkpoints.missionTitle,
      missionType: checkpoints.missionType,
      gmsConnection: checkpoints.gmsConnection,
      gmsMeaning: checkpoints.gmsMeaning,
      gmsJoy: checkpoints.gmsJoy,
      gmsGrowth: checkpoints.gmsGrowth,
      timeLimitSeconds: checkpoints.timeLimitSeconds,
      bonusPhotoPoints: checkpoints.bonusPhotoPoints,
    })
    .from(checkpoints)
    .where(eq(checkpoints.tourId, tour.id))
    .orderBy(asc(checkpoints.orderIndex))

  return NextResponse.json({ ...tour, checkpoints: cps })
}
