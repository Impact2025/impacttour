import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions, teams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateTeamToken } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  names: z.array(z.string().min(1).max(40)).min(1).max(50),
})

/**
 * POST /api/klant/[sessionId]/teams/bulk
 * Maak meerdere teams tegelijk aan voor een sessie
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { sessionId } = await params

  // Controleer of sessie van deze gebruiker is
  const gameSession = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
  })

  if (!gameSession) {
    return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
  }
  if (gameSession.spelleIderId !== session.user.id) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige teamnamen' }, { status: 400 })
  }

  const { names } = parsed.data

  // Verwijder duplicaten (case-insensitive)
  const uniqueNames = [...new Set(names.map((n) => n.trim()).filter(Boolean))]

  // Haal bestaande teamnamen op
  const existingTeams = await db.query.teams.findMany({
    where: eq(teams.gameSessionId, sessionId),
    columns: { name: true },
  })
  const existingNames = new Set(existingTeams.map((t) => t.name.toLowerCase()))

  const toCreate = uniqueNames.filter((n) => !existingNames.has(n.toLowerCase()))

  if (toCreate.length === 0) {
    return NextResponse.json({ message: 'Alle teams bestaan al', created: [] })
  }

  // Bulk insert
  const inserted = await db.insert(teams).values(
    toCreate.map((name) => ({
      gameSessionId: sessionId,
      name,
      teamToken: generateTeamToken(),
    }))
  ).returning({ id: teams.id, name: teams.name, teamToken: teams.teamToken })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return NextResponse.json({
    created: inserted.map((t) => ({
      id: t.id,
      name: t.name,
      joinCode: gameSession.joinCode,
      deepLink: `${appUrl}/join?code=${gameSession.joinCode}&team=${encodeURIComponent(t.name)}`,
    })),
  })
}
