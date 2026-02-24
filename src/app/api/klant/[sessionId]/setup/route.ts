import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  customSessionName: z.string().min(1).max(100).optional(),
  welcomeMessage: z.string().max(300).optional(),
  scheduledAt: z.string().optional(),
  parentalConsentConfirmed: z.boolean().optional(),
})

/**
 * GET /api/klant/[sessionId]/setup
 * Ophalen sessie + teams voor de setup wizard
 *
 * PUT /api/klant/[sessionId]/setup
 * Bijwerken naam / welkomstbericht
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { sessionId } = await params

  const gameSession = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
    with: { tour: true, teams: true },
  })

  if (!gameSession || gameSession.spelleIderId !== session.user.id) {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: gameSession.id,
    joinCode: gameSession.joinCode,
    status: gameSession.status,
    customSessionName: gameSession.customSessionName,
    welcomeMessage: gameSession.welcomeMessage,
    scheduledAt: gameSession.scheduledAt,
    organizationName: gameSession.organizationName,
    parentalConsentConfirmed: gameSession.parentalConsentConfirmed,
    tour: gameSession.tour
      ? {
          id: gameSession.tour.id,
          name: gameSession.tour.name,
          variant: gameSession.tour.variant,
          estimatedDurationMin: gameSession.tour.estimatedDurationMin,
        }
      : null,
    teams: gameSession.teams.map((t) => ({
      id: t.id,
      name: t.name,
      deepLink: `${appUrl}/join?code=${gameSession.joinCode}&team=${encodeURIComponent(t.name)}`,
    })),
    joinLink: `${appUrl}/join?code=${gameSession.joinCode}`,
  })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { sessionId } = await params

  const gameSession = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
  })

  if (!gameSession || gameSession.spelleIderId !== session.user.id) {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { customSessionName, welcomeMessage, scheduledAt, parentalConsentConfirmed } = parsed.data

  await db.update(gameSessions)
    .set({
      customSessionName: customSessionName ?? gameSession.customSessionName,
      welcomeMessage: welcomeMessage ?? gameSession.welcomeMessage,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : gameSession.scheduledAt,
      ...(parentalConsentConfirmed !== undefined && {
        parentalConsentConfirmed,
        parentalConsentAt: parentalConsentConfirmed ? new Date() : null,
      }),
    })
    .where(eq(gameSessions.id, sessionId))

  return NextResponse.json({ success: true })
}
