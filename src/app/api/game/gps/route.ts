import { db } from '@/lib/db'
import { gameSessions, teams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isPointInPolygon } from '@/lib/geo'
import {
  broadcastTeamPosition,
  broadcastGeofenceAlert,
} from '@/lib/pusher'
import type { GeoPoint } from '@/lib/geo'

const schema = z.object({
  sessionId: z.string().uuid(),
  teamToken: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(), // GPS accuracy in meters
})

/**
 * POST /api/game/gps
 * Team stuurt GPS positie update
 * - Server-side throttle: max 1 Pusher broadcast per 10s per team (via lastPositionAt check)
 * - Geofence check voor JeugdTocht
 * - Positie opslaan in DB
 */
export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { sessionId, teamToken, latitude, longitude } = parsed.data

  // Haal sessie en team op
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
  })

  if (!session || session.status !== 'active') {
    return NextResponse.json({ error: 'Sessie niet actief' }, { status: 400 })
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.teamToken, teamToken),
  })

  if (!team || team.gameSessionId !== sessionId) {
    return NextResponse.json({ error: 'Ongeldig team token' }, { status: 401 })
  }

  // Throttle: max 1 Pusher event per 10 seconden
  const now = new Date()
  const lastPos = team.lastPositionAt
  const shouldBroadcast =
    !lastPos || now.getTime() - lastPos.getTime() > 10_000

  // Geofence check (JeugdTocht)
  let isOutsideGeofence = false
  if (session.geofencePolygon && Array.isArray(session.geofencePolygon)) {
    const polygon = session.geofencePolygon as GeoPoint[]
    if (polygon.length >= 3) {
      isOutsideGeofence = !isPointInPolygon({ lat: latitude, lng: longitude }, polygon)
    }
  }

  // Update team positie in DB
  await db
    .update(teams)
    .set({
      lastLatitude: latitude,
      lastLongitude: longitude,
      lastPositionAt: now,
      isOutsideGeofence,
    })
    .where(eq(teams.id, team.id))

  // Pusher broadcasts (alleen als throttle period voorbij is)
  if (shouldBroadcast) {
    await broadcastTeamPosition(sessionId, {
      teamId: team.id,
      teamName: team.name,
      lat: latitude,
      lng: longitude,
      isOutsideGeofence,
    })

    // Geofence alarm als team buiten zone gaat (en eerder binnen was)
    if (isOutsideGeofence && !team.isOutsideGeofence) {
      await broadcastGeofenceAlert(sessionId, {
        teamId: team.id,
        teamName: team.name,
        lat: latitude,
        lng: longitude,
      })
    }
  }

  return NextResponse.json({
    isOutsideGeofence,
    throttled: !shouldBroadcast,
  })
}
