import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { broadcastSessionStatus } from '@/lib/pusher'

const updateSchema = z.object({
  status: z.enum(['lobby', 'active', 'paused', 'completed', 'cancelled']).optional(),
  geofencePolygon: z.array(z.object({ lat: z.number(), lng: z.number() })).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
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

  const [updated] = await db
    .update(gameSessions)
    .set(updates)
    .where(and(eq(gameSessions.id, id), eq(gameSessions.spelleIderId, session.user.id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })

  // Broadcast status verandering via Pusher
  if (parsed.data.status) {
    await broadcastSessionStatus(id, parsed.data.status)
  }

  return NextResponse.json(updated)
}
