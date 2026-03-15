import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions, sessionScores } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { broadcastSessionStatus } from '@/lib/pusher'
import { generateCoachInsight } from '@/lib/ai'

const updateSchema = z.object({
  status: z.enum(['lobby', 'active', 'paused', 'completed', 'cancelled']).optional(),
  geofencePolygon: z.array(z.object({ lat: z.number(), lng: z.number() })).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  isTestMode: z.boolean().optional(),
})

/** GET /api/sessions/[id] — Haal sessie op met teams */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params

  const gameSession = await db.query.gameSessions.findFirst({
    where: and(eq(gameSessions.id, id), eq(gameSessions.spelleIderId, session.user.id)),
    with: { teams: true, tour: true },
  })

  if (!gameSession) return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })

  return NextResponse.json(gameSession)
}

/** PUT /api/sessions/[id] — Update sessie status / geofence */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.status) {
    updates.status = parsed.data.status
    if (parsed.data.status === 'active') updates.startedAt = new Date()
    if (parsed.data.status === 'completed') updates.completedAt = new Date()
  }
  if (parsed.data.geofencePolygon !== undefined) {
    updates.geofencePolygon = parsed.data.geofencePolygon
  }
  if (parsed.data.scheduledAt !== undefined) {
    updates.scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null
  }
  if (parsed.data.isTestMode !== undefined) {
    updates.isTestMode = parsed.data.isTestMode
  }

  const [updated] = await db
    .update(gameSessions)
    .set(updates)
    .where(and(eq(gameSessions.id, id), eq(gameSessions.spelleIderId, session.user.id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })

  // Broadcast status verandering via Pusher (optioneel — niet blokkerend)
  if (parsed.data.status) {
    broadcastSessionStatus(id, parsed.data.status).catch(() => null)
  }

  // Bij afronden: pre-genereer coach insights voor alle teams (fire-and-forget)
  // Zodat het rapport direct opent zonder AI wachttijd
  if (parsed.data.status === 'completed') {
    preGenerateCoachInsights(id).catch(() => null)
  }

  return NextResponse.json(updated)
}

/**
 * Pre-genereert coach insights voor alle teams in een sessie.
 * Wordt asynchroon aangeroepen bij status → 'completed'.
 * Legt resultaten vast in session_scores.coach_insight zodat het rapport
 * direct opent zonder AI wachttijd.
 */
async function preGenerateCoachInsights(sessionId: string) {
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
    with: {
      tour: { with: { checkpoints: { orderBy: (c, { asc }) => [asc(c.orderIndex)] } } },
      teams: true,
    },
  })
  if (!session?.tour) return

  const checkpoints = session.tour.checkpoints
  const gmsMax = checkpoints.reduce((s, c) => s + c.gmsConnection + c.gmsMeaning + c.gmsJoy + c.gmsGrowth, 0)
  const dimensionMaxes = checkpoints.reduce(
    (acc, c) => ({
      connection: acc.connection + c.gmsConnection,
      meaning: acc.meaning + c.gmsMeaning,
      joy: acc.joy + c.gmsJoy,
      growth: acc.growth + c.gmsGrowth,
    }),
    { connection: 0, meaning: 0, joy: 0, growth: 0 }
  )

  for (const team of session.teams) {
    // Sla over als insight al bestaat
    const existing = await db.query.sessionScores.findFirst({
      where: and(eq(sessionScores.sessionId, sessionId), eq(sessionScores.teamId, team.id)),
    })
    if (existing?.coachInsight) continue

    try {
      const scores = existing
        ? {
            connection: existing.connection,
            meaning: existing.meaning,
            joy: existing.joy,
            growth: existing.growth,
            checkpointScores: existing.checkpointScores as { name: string; gmsEarned: number; orderIndex: number }[],
          }
        : { connection: 0, meaning: 0, joy: 0, growth: 0, checkpointScores: [] }

      const insight = await generateCoachInsight({
        teamName: team.name,
        tourName: session.tour!.name,
        variant: session.variant,
        totalScore: team.totalGmsScore,
        gmsMax: gmsMax || 400,
        dimensions: { connection: scores.connection, meaning: scores.meaning, joy: scores.joy, growth: scores.growth },
        dimensionMaxes,
        checkpointsCompleted: (scores.checkpointScores ?? []).length,
        totalCheckpoints: checkpoints.length,
        checkpointScores: scores.checkpointScores ?? [],
      })

      await db.insert(sessionScores)
        .values({
          sessionId,
          teamId: team.id,
          connection: scores.connection,
          meaning: scores.meaning,
          joy: scores.joy,
          growth: scores.growth,
          totalGms: scores.connection + scores.meaning + scores.joy + scores.growth,
          checkpointsCount: (scores.checkpointScores ?? []).length,
          checkpointScores: scores.checkpointScores ?? [],
          coachInsight: insight,
        })
        .onConflictDoUpdate({
          target: [sessionScores.sessionId, sessionScores.teamId],
          set: { coachInsight: insight },
        })
    } catch {
      // Stil falen — rapport valt terug op lazy generatie bij eerste view
    }
  }
}
