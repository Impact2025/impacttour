import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions, checkpoints } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateReportNarrative } from '@/lib/ai'

/**
 * GET /api/pdf/[sessionId]
 * Genereert een PDF impactrapport voor een afgeronde sessie.
 * Alleen toegankelijk voor de spelleider van de sessie.
 * maxDuration: 60s (geconfigureerd in vercel.json)
 * @react-pdf/renderer wordt lazy geladen om OOM tijdens build te voorkomen.
 */
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { sessionId } = await params

  const gameSession = await db.query.gameSessions.findFirst({
    where: and(
      eq(gameSessions.id, sessionId),
      eq(gameSessions.spelleIderId, session.user.id)
    ),
    with: {
      tour: true,
      teams: { orderBy: (t, { desc }) => [desc(t.totalGmsScore)] },
    },
  })

  if (!gameSession) return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
  if (gameSession.status !== 'completed') {
    return NextResponse.json({ error: 'Sessie nog niet afgerond' }, { status: 400 })
  }

  const tourCheckpoints = await db.query.checkpoints.findMany({
    where: eq(checkpoints.tourId, gameSession.tourId),
    orderBy: (c, { asc }) => [asc(c.orderIndex)],
  })

  const teams = gameSession.teams
  const totalTeams = teams.length

  const avgGmsScore = totalTeams
    ? Math.round(teams.reduce((s, t) => s + t.totalGmsScore, 0) / totalTeams)
    : 0

  const topTeam = teams[0] ?? null

  const totalConnection = tourCheckpoints.reduce((s, c) => s + c.gmsConnection, 0)
  const totalMeaning = tourCheckpoints.reduce((s, c) => s + c.gmsMeaning, 0)
  const totalJoy = tourCheckpoints.reduce((s, c) => s + c.gmsJoy, 0)
  const totalGrowth = tourCheckpoints.reduce((s, c) => s + c.gmsGrowth, 0)
  const grandTotal = totalConnection + totalMeaning + totalJoy + totalGrowth || 1

  const gmsBreakdown = {
    connection: Math.round((totalConnection / grandTotal) * avgGmsScore),
    meaning: Math.round((totalMeaning / grandTotal) * avgGmsScore),
    joy: Math.round((totalJoy / grandTotal) * avgGmsScore),
    growth: Math.round((totalGrowth / grandTotal) * avgGmsScore),
  }

  let narrative = ''
  try {
    narrative = await generateReportNarrative({
      tourName: gameSession.tour?.name ?? 'ImpactTocht',
      variant: gameSession.tour?.variant ?? gameSession.variant,
      totalTeams,
      avgGmsScore,
      topTeam: topTeam?.name ?? 'Onbekend',
      gmsBreakdown,
    })
  } catch {
    narrative = `${totalTeams} teams namen deel aan de ${gameSession.tour?.name ?? 'ImpactTocht'} en behaalden een gemiddelde GMS score van ${avgGmsScore} punten.`
  }

  // Lazy load PDF renderer om OOM-fouten tijdens build te voorkomen
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { createElement } = await import('react')
  const { ImpactRapport } = await import('@/lib/pdf/impact-rapport')

  const rapportProps = {
    tourName: gameSession.tour?.name ?? 'ImpactTocht',
    variant: gameSession.tour?.variant ?? gameSession.variant,
    sessionDate: gameSession.startedAt ?? gameSession.createdAt,
    totalTeams,
    avgGmsScore,
    gmsBreakdown,
    topTeams: teams.slice(0, 10).map((t, idx) => ({
      rank: idx + 1,
      name: t.name,
      score: t.totalGmsScore,
      checkpointsDone: Array.isArray(t.completedCheckpoints)
        ? (t.completedCheckpoints as string[]).length
        : 0,
    })),
    totalCheckpoints: tourCheckpoints.length,
    narrative,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfElement = createElement(ImpactRapport, rapportProps) as any
  const pdfBuffer = await renderToBuffer(pdfElement)

  const filename = `impactrapport-${gameSession.tour?.name?.replace(/\s+/g, '-').toLowerCase() ?? sessionId}.pdf`

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
