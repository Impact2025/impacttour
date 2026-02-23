import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions, checkpoints } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateDebriefing } from '@/lib/ai'

/**
 * POST /api/spelleider/sessies/[id]/debriefing
 * Genereert een AI debriefing voor een afgeronde sessie (Functie E).
 * Aggregeert GMS scores van alle teams + submissions.
 */
export const maxDuration = 60

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params

  const gameSession = await db.query.gameSessions.findFirst({
    where: and(eq(gameSessions.id, id), eq(gameSessions.spelleIderId, session.user.id)),
    with: {
      tour: { columns: { name: true, variant: true } },
      teams: true,
    },
  })

  if (!gameSession) return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
  if (gameSession.status !== 'completed') {
    return NextResponse.json({ error: 'Sessie is nog niet afgerond' }, { status: 400 })
  }

  // Haal checkpoints op voor totaal
  const tourCheckpoints = await db.query.checkpoints.findMany({
    where: eq(checkpoints.tourId, gameSession.tourId),
  })

  // Aggregeer GMS scores van alle teams
  const allTeams = gameSession.teams
  if (allTeams.length === 0) {
    return NextResponse.json({ error: 'Geen teams in deze sessie' }, { status: 400 })
  }

  // Haal submissions op voor GMS breakdown
  const teamIds = allTeams.map((t) => t.id)
  const allSubmissions = await db.query.submissions.findMany({
    where: (sub, { inArray }) => inArray(sub.teamId, teamIds),
  })

  // Bereken gemiddelde GMS breakdown via AI evaluaties
  let totalConnection = 0
  let totalMeaning = 0
  let totalJoy = 0
  let totalGrowth = 0
  let evalCount = 0

  for (const sub of allSubmissions) {
    const breakdown = sub.aiEvaluation as {
      connection?: number; meaning?: number; joy?: number; growth?: number
    } | null

    if (breakdown) {
      totalConnection += breakdown.connection ?? 0
      totalMeaning += breakdown.meaning ?? 0
      totalJoy += breakdown.joy ?? 0
      totalGrowth += breakdown.growth ?? 0
      evalCount++
    }
  }

  const divisor = evalCount || 1
  const gmsBreakdown = {
    connection: Math.round(totalConnection / divisor),
    meaning: Math.round(totalMeaning / divisor),
    joy: Math.round(totalJoy / divisor),
    growth: Math.round(totalGrowth / divisor),
  }

  // Gemiddelde totaal score
  const avgScore = Math.round(
    allTeams.reduce((sum, t) => sum + t.totalGmsScore, 0) / allTeams.length
  )

  // Best presterende team (voor highlights)
  const topTeam = allTeams.sort((a, b) => b.totalGmsScore - a.totalGmsScore)[0]
  const completedCount = Array.isArray(topTeam.completedCheckpoints)
    ? (topTeam.completedCheckpoints as string[]).length
    : 0

  try {
    const debriefing = await generateDebriefing({
      tourName: gameSession.tour?.name ?? 'ImpactTocht',
      teamName: allTeams.length === 1 ? allTeams[0].name : `${allTeams.length} teams`,
      totalScore: avgScore,
      checkpointsCompleted: completedCount,
      totalCheckpoints: tourCheckpoints.length,
      gmsBreakdown,
      highlights: [`Winnend team: ${topTeam.name} (${topTeam.totalGmsScore} GMS)`],
    })

    return NextResponse.json({ debriefing, gmsBreakdown, avgScore })
  } catch {
    return NextResponse.json({ error: 'AI debriefing genereren mislukt' }, { status: 503 })
  }
}
