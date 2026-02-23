import { db } from '@/lib/db'
import { gameSessions, teams, checkpoints } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { haversineDistance } from '@/lib/geo'
import { broadcastCheckpointUnlocked } from '@/lib/pusher'

const schema = z.object({
  sessionId: z.string().uuid(),
  teamToken: z.string().min(1),
  checkpointId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

/**
 * POST /api/game/checkpoint
 * Team vraagt checkpoint unlock aan.
 * Vereiste: team is binnen unlockRadiusMeters van het checkpoint.
 */
export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { sessionId, teamToken, checkpointId, latitude, longitude } = parsed.data

  // Haal sessie op
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
  })

  if (!session || session.status !== 'active') {
    return NextResponse.json({ error: 'Sessie niet actief' }, { status: 400 })
  }

  // Haal team op
  const team = await db.query.teams.findFirst({
    where: eq(teams.teamToken, teamToken),
  })

  if (!team || team.gameSessionId !== sessionId) {
    return NextResponse.json({ error: 'Ongeldig team token' }, { status: 401 })
  }

  // Haal checkpoint op
  const checkpoint = await db.query.checkpoints.findFirst({
    where: and(
      eq(checkpoints.id, checkpointId),
      eq(checkpoints.tourId, session.tourId)
    ),
  })

  if (!checkpoint) {
    return NextResponse.json({ error: 'Checkpoint niet gevonden' }, { status: 404 })
  }

  // Controleer of dit het juiste checkpoint is (volgorde)
  if (checkpoint.orderIndex !== team.currentCheckpointIndex) {
    return NextResponse.json(
      { error: 'Dit is niet het huidige checkpoint' },
      { status: 400 }
    )
  }

  // Controleer of team al dit checkpoint heeft voltooid
  const completed = Array.isArray(team.completedCheckpoints)
    ? (team.completedCheckpoints as string[])
    : []

  if (completed.includes(checkpointId)) {
    return NextResponse.json({ error: 'Checkpoint al voltooid' }, { status: 400 })
  }

  // GPS afstandscheck: Haversine (overgeslagen in test mode)
  const distance = haversineDistance(
    latitude,
    longitude,
    checkpoint.latitude,
    checkpoint.longitude
  )

  if (!session.isTestMode && distance > checkpoint.unlockRadiusMeters) {
    return NextResponse.json(
      {
        error: `Te ver van checkpoint (${Math.round(distance)}m, max ${checkpoint.unlockRadiusMeters}m)`,
        distance: Math.round(distance),
        required: checkpoint.unlockRadiusMeters,
      },
      { status: 400 }
    )
  }

  // Checkpoint unlocken — update team
  const newCompleted = [...completed, checkpointId]
  await db
    .update(teams)
    .set({
      currentCheckpointIndex: team.currentCheckpointIndex + 1,
      completedCheckpoints: newCompleted,
    })
    .where(eq(teams.id, team.id))

  // Broadcast naar alle deelnemers en spelleider (optioneel — niet blokkerend)
  broadcastCheckpointUnlocked(sessionId, {
    teamId: team.id,
    teamName: team.name,
    checkpointIndex: checkpoint.orderIndex,
    checkpointName: checkpoint.name,
    gmsEarned: 0,
  }).catch(() => null)

  return NextResponse.json({
    success: true,
    checkpoint: {
      id: checkpoint.id,
      name: checkpoint.name,
      missionTitle: checkpoint.missionTitle,
      missionDescription: checkpoint.missionDescription,
      missionType: checkpoint.missionType,
      hint1: checkpoint.hint1,
      hint2: checkpoint.hint2,
      hint3: checkpoint.hint3,
    },
    distance: Math.round(distance),
  })
}
