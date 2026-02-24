import { db } from '@/lib/db'
import { gameSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

/**
 * GET /api/game/session/[sessionId]
 * Haal volledige game data op voor een team (publiek, auth via teamToken header)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const teamToken = req.headers.get('x-team-token')

  if (!teamToken) {
    return NextResponse.json({ error: 'Geen team token' }, { status: 401 })
  }

  // Verifieer team token + haal sessie op
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
    with: {
      tour: {
        with: {
          checkpoints: {
            orderBy: (c, { asc }) => [asc(c.orderIndex)],
          },
        },
      },
      teams: {
        orderBy: (t, { desc, asc }) => [desc(t.totalGmsScore), asc(t.id)],
      },
    },
  })

  if (!session) {
    return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
  }

  if (session.status === 'cancelled') {
    return NextResponse.json({ error: 'Sessie geannuleerd' }, { status: 400 })
  }

  // Zoek het team op basis van token
  const team = session.teams.find((t) => t.teamToken === teamToken)
  if (!team) {
    return NextResponse.json({ error: 'Ongeldig team token' }, { status: 401 })
  }

  // Verberg hints en antwoorden van nog niet voltooide checkpoints
  const completedIds = new Set(
    Array.isArray(team.completedCheckpoints) ? team.completedCheckpoints : []
  )

  const checkpointsForTeam = session.tour?.checkpoints.map((cp) => {
    const isCompleted = completedIds.has(cp.id)
    const isCurrent = cp.orderIndex === team.currentCheckpointIndex
    const isAccessible = cp.orderIndex <= team.currentCheckpointIndex

    return {
      id: cp.id,
      orderIndex: cp.orderIndex,
      name: cp.name,
      type: cp.type,
      latitude: cp.latitude,
      longitude: cp.longitude,
      unlockRadiusMeters: cp.unlockRadiusMeters,
      missionTitle: isAccessible ? cp.missionTitle : null,
      missionDescription: isAccessible ? cp.missionDescription : null,
      missionType: cp.missionType,
      gmsConnection: cp.gmsConnection,
      gmsMeaning: cp.gmsMeaning,
      gmsJoy: cp.gmsJoy,
      gmsGrowth: cp.gmsGrowth,
      // Hints alleen tonen als het checkpoint toegankelijk is
      hint1: isAccessible ? cp.hint1 : null,
      hint2: isAccessible ? cp.hint2 : null,
      hint3: isAccessible ? cp.hint3 : null,
      isKidsFriendly: cp.isKidsFriendly,
      timeLimitSeconds: cp.timeLimitSeconds,
      bonusPhotoPoints: cp.bonusPhotoPoints,
      isCompleted,
      isCurrent,
    }
  }) ?? []

  return NextResponse.json({
    sessionId: session.id,
    status: session.status,
    variant: session.variant,
    joinCode: session.joinCode,
    isTestMode: session.isTestMode,
    geofencePolygon: session.geofencePolygon,
    tour: {
      name: session.tour?.name,
      variant: session.tour?.variant,
      storyFrame: session.tour?.storyFrame ?? null,
    },
    checkpoints: checkpointsForTeam,
    team: {
      id: team.id,
      name: team.name,
      currentCheckpointIndex: team.currentCheckpointIndex,
      completedCheckpoints: team.completedCheckpoints,
      totalGmsScore: team.totalGmsScore,
      bonusPoints: team.bonusPoints,
      isOutsideGeofence: team.isOutsideGeofence,
    },
    scoreboard: session.teams.map((t, idx) => ({
      rank: idx + 1,
      teamName: t.name,
      totalGmsScore: t.totalGmsScore,
      bonusPoints: t.bonusPoints,
      checkpointsDone: Array.isArray(t.completedCheckpoints)
        ? t.completedCheckpoints.length
        : 0,
      isCurrentTeam: t.teamToken === teamToken,
    })),
  })
}
