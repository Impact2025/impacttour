import { db } from '@/lib/db'
import { gameSessions, teams, tours } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateTeamToken } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  joinCode: z.string().length(6).toUpperCase(),
  teamName: z.string().min(1).max(30).trim(),
})

/**
 * POST /api/game/join
 * Team neemt deel aan een spelsessie via join code
 */
export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { joinCode, teamName } = parsed.data

  // Zoek actieve sessie op code
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.joinCode, joinCode),
    with: { teams: true },
  })

  if (!session) {
    return NextResponse.json({ error: 'Ongeldige teamcode. Controleer de code en probeer opnieuw.' }, { status: 404 })
  }

  if (session.status === 'completed' || session.status === 'cancelled') {
    return NextResponse.json({ error: 'Deze tocht is al afgerond.' }, { status: 400 })
  }

  if (session.status === 'draft') {
    return NextResponse.json({ error: 'De tocht is nog niet gestart. Wacht op je spelleider.' }, { status: 400 })
  }

  // Als het team al bestaat (spelleider heeft het vooraf aangemaakt) → sluit je aan bij dat team
  const existingTeam = session.teams.find(
    (t) => t.name.toLowerCase() === teamName.toLowerCase()
  )

  let team: { id: string; teamToken: string }

  if (existingTeam) {
    team = existingTeam
  } else {
    // Controleer max teams alleen bij het aanmaken van een nieuw team
    const tour = await db.query.tours.findFirst({ where: eq(tours.id, session.tourId) })
    if (tour && session.teams.length >= (tour.maxTeams ?? 20)) {
      return NextResponse.json({ error: 'Het maximale aantal teams is bereikt.' }, { status: 400 })
    }

    // Zelf team aanmaken (vrije deelname zonder vooraf aangemaakt team)
    const teamToken = generateTeamToken()
    const [newTeam] = await db
      .insert(teams)
      .values({
        gameSessionId: session.id,
        name: teamName,
        teamToken,
      })
      .returning()
    team = newTeam
  }

  return NextResponse.json({
    teamId: team.id,
    teamToken: team.teamToken,
    sessionId: session.id,
    variant: session.variant,
    status: session.status,
  })
}
