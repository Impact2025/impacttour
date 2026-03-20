/**
 * Shared tocht-builder: zet een gegenereerde tocht-aanvraag om naar
 * een echte Tour + Checkpoints + GameSession + magic link email.
 *
 * Wordt gebruikt door:
 *  - /api/multisafepay/webhook (na betaling)
 *  - /api/tocht-op-maat/checkout (gratis flow via coupon)
 */
import { db } from '@/lib/db'
import {
  orders,
  gameSessions,
  users,
  tours,
  checkpoints,
  tochtAanvragen,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { generateMagicLink } from '@/lib/auth/magic-link'
import { generateJoinCode } from '@/lib/utils'
import { geocodeAllMissions } from '@/lib/geocoding'

// GMS dimensieverdeling per missie-type
function gmsForType(type: string): { c: number; m: number; j: number; g: number } {
  switch (type) {
    case 'sociaal':
    case 'impact':   return { c: 20, m: 18, j: 7,  g: 5  }
    case 'actie':    return { c: 8,  m: 7,  j: 20, g: 15 }
    case 'creatief': return { c: 10, m: 12, j: 15, g: 13 }
    case 'quiz':     return { c: 5,  m: 18, j: 12, g: 15 }
    default:         return { c: 12, m: 13, j: 12, g: 13 }
  }
}

// Variant mapping: wizard groeptype → tour variant
export function variantFromGroep(
  groepType: string
): 'wijktocht' | 'impactsprint' | 'familietocht' | 'jeugdtocht' | 'voetbalmissie' {
  if (groepType === 'stel' || groepType === 'familie') return 'familietocht'
  if (groepType === 'school')                          return 'jeugdtocht'
  return 'wijktocht'
}

interface AanvraagRow {
  id: string
  groepType: string
  stad: string
  duurMinuten: number
  deelnemers: number
  gegenereerdeJson: unknown
}

interface OrderRow {
  id: string
  userId: string
  amountCents: number
  tochtAanvraagId: string | null
}

export async function buildSpeelbareTocht(
  order: OrderRow,
  appUrl: string
): Promise<{ tourId: string; sessionId: string }> {
  const aanvraag = await db.query.tochtAanvragen.findFirst({
    where: eq(tochtAanvragen.id, order.tochtAanvraagId!),
  }) as AanvraagRow | undefined

  if (!aanvraag) throw new Error(`Aanvraag niet gevonden: ${order.tochtAanvraagId}`)

  await db
    .update(tochtAanvragen)
    .set({ status: 'building' })
    .where(eq(tochtAanvragen.id, aanvraag.id))

  const tocht = aanvraag.gegenereerdeJson as {
    title: string
    description?: string
    difficulty?: string
    missions: Array<{
      title: string
      location: string
      description: string
      type: string
      points: number
    }>
  }

  const variant = variantFromGroep(aanvraag.groepType)

  // Geocodeer alle locaties sequentieel (Nominatim rate limit)
  const coords = await geocodeAllMissions(
    tocht.missions.map((m) => ({ location: m.location })),
    aanvraag.stad
  )

  // Tour aanmaken
  const [tour] = await db
    .insert(tours)
    .values({
      name: tocht.title,
      description: tocht.description ?? null,
      variant,
      isPublished: false,
      estimatedDurationMin: aanvraag.duurMinuten,
      maxTeams: 5,
      pricingModel: 'flat',
      priceInCents: 0,
      pricePerPersonCents: 0,
      aiConfig: {
        source: 'self-service',
        difficulty: tocht.difficulty ?? 'Middel',
        stad: aanvraag.stad,
      },
    })
    .returning()

  // Checkpoints aanmaken
  for (let i = 0; i < tocht.missions.length; i++) {
    const m = tocht.missions[i]
    const gms = gmsForType(m.type)
    const cp = coords[i]
    const cpType =
      i === 0
        ? 'kennismaking'
        : i === tocht.missions.length - 1
        ? 'feest'
        : m.type === 'sociaal' || m.type === 'impact'
        ? 'actie'
        : 'samenwerking'

    await db.insert(checkpoints).values({
      tourId: tour.id,
      orderIndex: i,
      name: m.location || m.title,
      type: cpType as 'kennismaking' | 'samenwerking' | 'reflectie' | 'actie' | 'feest',
      latitude: cp.lat,
      longitude: cp.lng,
      unlockRadiusMeters: 50,
      missionTitle: m.title,
      missionDescription: m.description,
      missionType: m.type === 'quiz' ? 'quiz' : 'opdracht',
      gmsConnection: gms.c,
      gmsMeaning: gms.m,
      gmsJoy: gms.j,
      gmsGrowth: gms.g,
      isKidsFriendly: variant === 'jeugdtocht',
    })
  }

  // Game sessie aanmaken
  const [session] = await db
    .insert(gameSessions)
    .values({
      tourId: tour.id,
      spelleIderId: order.userId,
      status: 'draft',
      joinCode: generateJoinCode(),
      variant,
      source: 'marketplace',
      paidAt: new Date(),
    })
    .returning()

  // Order + aanvraag bijwerken
  await db
    .update(orders)
    .set({ status: 'paid', paidAt: new Date(), tourId: tour.id, sessionId: session.id })
    .where(eq(orders.id, order.id))

  await db
    .update(tochtAanvragen)
    .set({ tourId: tour.id, sessionId: session.id, status: 'active' })
    .where(eq(tochtAanvragen.id, aanvraag.id))

  // Magic link + bevestigingsmail sturen
  const user = await db.query.users.findFirst({ where: eq(users.id, order.userId) })
  if (user) {
    const magicLink = await generateMagicLink({
      email: user.email,
      callbackPath: `/klant/${session.id}/setup`,
      appUrl,
    })
    await sendBookingConfirmationEmail({
      to: user.email,
      customerName: (user.name || 'klant').split(' ')[0],
      tourName: tocht.title,
      setupUrl: magicLink,
      loginUrl: `${appUrl}/login`,
      isPaid: order.amountCents > 0,
      amountFormatted:
        order.amountCents === 0
          ? 'Gratis (coupon)'
          : `€${(order.amountCents / 100).toFixed(2)}`,
      accountEmail: user.email,
    })
  }

  return { tourId: tour.id, sessionId: session.id }
}
