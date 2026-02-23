import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

/** POST /api/tours/[id]/clone
 *  Kopieer een gepubliceerde tour + alle checkpoints naar het account van de ingelogde spelleider.
 *  De kopie start als niet-gepubliceerd zodat de spelleider hem kan aanpassen.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params

  const originalTour = await db.query.tours.findFirst({
    where: eq(tours.id, id),
    with: { checkpoints: { orderBy: (c, { asc }) => [asc(c.orderIndex)] } },
  })

  if (!originalTour) {
    return NextResponse.json({ error: 'Tocht niet gevonden' }, { status: 404 })
  }
  if (!originalTour.isPublished) {
    return NextResponse.json({ error: 'Tocht is niet beschikbaar in de bibliotheek' }, { status: 403 })
  }

  // Maak een kopie van de tocht, eigendom van de huidige spelleider
  const [newTour] = await db
    .insert(tours)
    .values({
      name: originalTour.name,
      description: originalTour.description,
      variant: originalTour.variant,
      createdById: session.user.id,
      isPublished: false,
      estimatedDurationMin: originalTour.estimatedDurationMin,
      maxTeams: originalTour.maxTeams,
      priceInCents: originalTour.priceInCents,
      pricingModel: originalTour.pricingModel ?? 'flat',
      pricePerPersonCents: originalTour.pricePerPersonCents ?? 0,
      storyFrame: originalTour.storyFrame ?? undefined,
    })
    .returning()

  // Kopieer alle checkpoints
  if (originalTour.checkpoints.length > 0) {
    await db.insert(checkpoints).values(
      originalTour.checkpoints.map((cp) => ({
        tourId: newTour.id,
        orderIndex: cp.orderIndex,
        name: cp.name,
        description: cp.description,
        type: cp.type,
        latitude: cp.latitude,
        longitude: cp.longitude,
        unlockRadiusMeters: cp.unlockRadiusMeters,
        missionTitle: cp.missionTitle,
        missionDescription: cp.missionDescription,
        missionType: cp.missionType,
        gmsConnection: cp.gmsConnection,
        gmsMeaning: cp.gmsMeaning,
        gmsJoy: cp.gmsJoy,
        gmsGrowth: cp.gmsGrowth,
        hint1: cp.hint1,
        hint2: cp.hint2,
        hint3: cp.hint3,
        isKidsFriendly: cp.isKidsFriendly,
        timeLimitSeconds: cp.timeLimitSeconds,
        bonusPhotoPoints: cp.bonusPhotoPoints ?? 0,
      }))
    )
  }

  return NextResponse.json({ tourId: newTour.id }, { status: 201 })
}
