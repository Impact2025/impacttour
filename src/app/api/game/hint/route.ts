import { db } from '@/lib/db'
import { gameSessions, teams, checkpoints } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, checkOrigin } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  sessionId: z.string().uuid(),
  teamToken: z.string().min(1),
  checkpointId: z.string().uuid(),
  level: z.enum(['1', '2', '3']),
})

/**
 * POST /api/game/hint
 * Haal een specifieke hint op voor een checkpoint (niveau 1, 2 of 3)
 */
export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { sessionId, teamToken, checkpointId, level } = parsed.data

  if (!checkOrigin(req)) {
    return NextResponse.json({ error: 'Verboden' }, { status: 403 })
  }

  // Rate limit: max 30 hint-verzoeken per IP per minuut
  if (!(await checkRateLimit(`hint:${getClientIp(req)}`, 30, 60_000))) {
    return NextResponse.json({ error: 'Te veel hint-verzoeken. Wacht even.' }, { status: 429 })
  }

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

  const checkpoint = await db.query.checkpoints.findFirst({
    where: and(
      eq(checkpoints.id, checkpointId),
      eq(checkpoints.tourId, session.tourId)
    ),
  })

  if (!checkpoint) {
    return NextResponse.json({ error: 'Checkpoint niet gevonden' }, { status: 404 })
  }

  const hintMap = { '1': checkpoint.hint1, '2': checkpoint.hint2, '3': checkpoint.hint3 }
  const hint = hintMap[level]

  if (!hint) {
    return NextResponse.json({ error: 'Geen hint beschikbaar op dit niveau' }, { status: 404 })
  }

  return NextResponse.json({ hint, level })
}
