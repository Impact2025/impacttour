import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { generateTour } from '@/lib/ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2).max(100),
  variant: z.enum(['wijktocht', 'impactsprint', 'familietocht', 'jeugdtocht', 'voetbalmissie']),
  location: z.string().min(2),
  teamSize: z.number().int().min(2).max(50).default(8),
  durationMinutes: z.number().int().min(30).max(480).default(120),
  themes: z.array(z.string()).optional(),
  checkpointCount: z.number().int().min(3).max(15).optional(),
  maxTeams: z.number().int().min(1).max(100).default(20),
  priceInCents: z.number().int().min(0).default(0),
  pricingModel: z.enum(['flat', 'per_person']).default('flat'),
  pricePerPersonCents: z.number().int().min(0).default(0),
})

/**
 * POST /api/ai/generate-tour
 * Genereert een complete tocht met checkpoints via AI (Functie F)
 */
export const maxDuration = 30

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Ongeldige gegevens', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const params = parsed.data

  // Genereer tocht via AI
  const generated = await generateTour({
    name: params.name,
    variant: params.variant,
    location: params.location,
    teamSize: params.teamSize,
    durationMinutes: params.durationMinutes,
    themes: params.themes,
    checkpointCount: params.checkpointCount,
  })

  // Sla tocht op in database
  const [tour] = await db
    .insert(tours)
    .values({
      name: params.name,
      description: generated.description,
      variant: params.variant,
      estimatedDurationMin: params.durationMinutes,
      maxTeams: params.maxTeams,
      priceInCents: params.priceInCents,
      pricingModel: params.pricingModel,
      pricePerPersonCents: params.pricePerPersonCents,
      createdById: session.user.id,
      aiConfig: {
        location: params.location,
        teamSize: params.teamSize,
        themes: params.themes,
        generatedAt: new Date().toISOString(),
      },
    })
    .returning()

  // Sla checkpoints op
  if (generated.checkpoints.length > 0) {
    await db.insert(checkpoints).values(
      generated.checkpoints.map((cp, idx) => ({
        tourId: tour.id,
        orderIndex: idx,
        name: cp.name,
        type: cp.type as 'kennismaking' | 'samenwerking' | 'reflectie' | 'actie' | 'feest',
        // Placeholder GPS (spelleider plaatst ze later via kaarteditor)
        latitude: 52.3676 + (Math.random() - 0.5) * 0.02,
        longitude: 4.9041 + (Math.random() - 0.5) * 0.02,
        unlockRadiusMeters: params.variant === 'impactsprint' ? 100 : 50,
        missionTitle: cp.missionTitle,
        missionDescription: cp.missionDescription,
        missionType: cp.missionType as 'opdracht' | 'foto' | 'quiz' | 'video',
        gmsConnection: cp.gmsConnection,
        gmsMeaning: cp.gmsMeaning,
        gmsJoy: cp.gmsJoy,
        gmsGrowth: cp.gmsGrowth,
        hint1: cp.hint1,
        hint2: cp.hint2,
        hint3: cp.hint3,
        isKidsFriendly: cp.isKidsFriendly,
        timeLimitSeconds: cp.timeLimitSeconds ?? null,
        bonusPhotoPoints: cp.bonusPhotoPoints ?? 0,
      }))
    )
  }

  return NextResponse.json({ tourId: tour.id }, { status: 201 })
}
