import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions, checkpoints } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateDebriefing } from '@/lib/ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { sessionId } = body as { sessionId?: string }
  if (!sessionId) return NextResponse.json({ error: 'sessionId vereist' }, { status: 400 })

  const gameSession = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
    with: {
      tour: { columns: { name: true, variant: true } },
      teams: true,
    },
  })

  if (!gameSession) return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
  if (gameSession.status !== 'completed') {
    return NextResponse.json({ error: 'Sessie is nog niet afgerond' }, { status: 400 })
  }

  // Spelleiders mogen alleen eigen sessies debrieven; admins mogen alles
  if (session.user.role !== 'admin' && gameSession.spelleIderId !== session.user.id) {
    return NextResponse.json({ error: 'Geen toegang tot deze sessie' }, { status: 403 })
  }

  const tourCheckpoints = await db.query.checkpoints.findMany({
    where: eq(checkpoints.tourId, gameSession.tourId),
  })

  const allTeams = gameSession.teams
  if (allTeams.length === 0) {
    return NextResponse.json({ error: 'Geen teams in deze sessie' }, { status: 400 })
  }

  const teamIds = allTeams.map((t) => t.id)
  const allSubmissions = await db.query.submissions.findMany({
    where: (sub, { inArray }) => inArray(sub.teamId, teamIds),
  })

  let totalConnection = 0, totalMeaning = 0, totalJoy = 0, totalGrowth = 0, evalCount = 0

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

  const d = evalCount || 1
  const gmsBreakdown = {
    connection: Math.round(totalConnection / d),
    meaning: Math.round(totalMeaning / d),
    joy: Math.round(totalJoy / d),
    growth: Math.round(totalGrowth / d),
  }

  const avgScore = Math.round(allTeams.reduce((sum, t) => sum + t.totalGmsScore, 0) / allTeams.length)
  const topTeam = [...allTeams].sort((a, b) => b.totalGmsScore - a.totalGmsScore)[0]
  const completedCount = Array.isArray(topTeam.completedCheckpoints)
    ? (topTeam.completedCheckpoints as string[]).length
    : 0

  try {
    const debriefing = await generateDebriefing({
      tourName: gameSession.tour?.name ?? 'IctusGo',
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
