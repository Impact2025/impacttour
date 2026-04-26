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

const RECOMMENDATIONS: Record<string, { action: string; why: string }> = {
  connection: {
    action: 'Plan kwartaallijkse cross-team activiteiten',
    why: 'Teams die elkaar kennen reduceren verzuim met tot 20%',
  },
  meaning: {
    action: 'Verbind dagelijkse taken aan maatschappelijk doel',
    why: 'Medewerkers met purpose-gevoel zijn 3× meer betrokken',
  },
  joy: {
    action: 'Introduceer wekelijkse informele check-ins',
    why: 'Werkplezier verhoogt productiviteit en verlaagt verloop',
  },
  growth: {
    action: 'Bied persoonlijke leerbudgetten of mentorschappen',
    why: 'Groeikansen zijn de #1 reden waarom talent blijft',
  },
}

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

  // Dimensie maxima (som over alle checkpoints)
  const dimensionMaxes = {
    connection: tourCheckpoints.reduce((s, c) => s + c.gmsConnection, 0),
    meaning:    tourCheckpoints.reduce((s, c) => s + c.gmsMeaning, 0),
    joy:        tourCheckpoints.reduce((s, c) => s + c.gmsJoy, 0),
    growth:     tourCheckpoints.reduce((s, c) => s + c.gmsGrowth, 0),
  }
  const gmsMax = dimensionMaxes.connection + dimensionMaxes.meaning + dimensionMaxes.joy + dimensionMaxes.growth || 100

  const avgGmsScore = totalTeams
    ? Math.round(teams.reduce((s, t) => s + t.totalGmsScore, 0) / totalTeams)
    : 0
  const avgGmsPct = Math.round((avgGmsScore / gmsMax) * 100)

  // GMS breakdown proportioneel verdeeld over de gemiddelde score
  const grandTotal = (dimensionMaxes.connection + dimensionMaxes.meaning + dimensionMaxes.joy + dimensionMaxes.growth) || 1
  const gmsBreakdown = {
    connection: Math.round((dimensionMaxes.connection / grandTotal) * avgGmsScore),
    meaning:    Math.round((dimensionMaxes.meaning    / grandTotal) * avgGmsScore),
    joy:        Math.round((dimensionMaxes.joy        / grandTotal) * avgGmsScore),
    growth:     Math.round((dimensionMaxes.growth     / grandTotal) * avgGmsScore),
  }
  const gmsBreakdownPct = {
    connection: dimensionMaxes.connection > 0 ? Math.round((gmsBreakdown.connection / dimensionMaxes.connection) * 100) : 0,
    meaning:    dimensionMaxes.meaning    > 0 ? Math.round((gmsBreakdown.meaning    / dimensionMaxes.meaning)    * 100) : 0,
    joy:        dimensionMaxes.joy        > 0 ? Math.round((gmsBreakdown.joy        / dimensionMaxes.joy)        * 100) : 0,
    growth:     dimensionMaxes.growth     > 0 ? Math.round((gmsBreakdown.growth     / dimensionMaxes.growth)     * 100) : 0,
  }

  // Team scores met proportionele dimensie-verdeling per team
  const teamScores = teams.slice(0, 10).map((t, idx) => {
    const pct = gmsMax > 0 ? t.totalGmsScore / gmsMax : 0
    return {
      rank: idx + 1,
      name: t.name,
      score: t.totalGmsScore,
      scorePct: Math.round(pct * 100),
      checkpointsDone: Array.isArray(t.completedCheckpoints) ? (t.completedCheckpoints as string[]).length : 0,
      dimensions: {
        connection: Math.round((dimensionMaxes.connection / grandTotal) * t.totalGmsScore),
        meaning:    Math.round((dimensionMaxes.meaning    / grandTotal) * t.totalGmsScore),
        joy:        Math.round((dimensionMaxes.joy        / grandTotal) * t.totalGmsScore),
        growth:     Math.round((dimensionMaxes.growth     / grandTotal) * t.totalGmsScore),
      },
    }
  })

  // Aanbevelingen op basis van laagste dimensie-scores
  const dimEntries = Object.entries(gmsBreakdownPct) as [keyof typeof gmsBreakdownPct, number][]
  const recommendations = dimEntries
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([key, pct]) => ({
      label:    key === 'connection' ? 'Verbinding' : key === 'meaning' ? 'Betekenis' : key === 'joy' ? 'Plezier' : 'Groei',
      score:    gmsBreakdown[key],
      maxScore: dimensionMaxes[key],
      pct,
      action:   RECOMMENDATIONS[key].action,
      why:      RECOMMENDATIONS[key].why,
    }))

  let narrative = ''
  try {
    narrative = await generateReportNarrative({
      tourName: gameSession.tour?.name ?? 'IctusGo',
      variant: gameSession.tour?.variant ?? gameSession.variant,
      totalTeams,
      avgGmsScore,
      topTeam: teams[0]?.name ?? 'Onbekend',
      gmsBreakdown,
    })
  } catch {
    narrative = `${totalTeams} ${totalTeams === 1 ? 'team nam' : 'teams namen'} deel aan de ${gameSession.tour?.name ?? 'IctusGo'} en behaalde${totalTeams === 1 ? '' : 'n'} een gemiddelde GMS score van ${avgGmsScore} punten (${avgGmsPct}%).`
  }

  // Lazy load PDF renderer om OOM-fouten tijdens build te voorkomen
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { createElement } = await import('react')
  const { ImpactRapport } = await import('@/lib/pdf/impact-rapport')

  const rapportProps = {
    tourName:         gameSession.tour?.name ?? 'IctusGo',
    variant:          gameSession.tour?.variant ?? gameSession.variant,
    sessionDate:      gameSession.startedAt ?? gameSession.createdAt,
    organizationName: gameSession.organizationName ?? undefined,
    totalTeams,
    totalParticipants: totalTeams,
    avgGmsScore,
    avgGmsPct,
    gmsMax,
    dimensionMaxes,
    gmsBreakdown,
    gmsBreakdownPct,
    teamScores,
    totalCheckpoints: tourCheckpoints.length,
    narrative,
    recommendations,
  }

  const pdfElement = createElement(ImpactRapport, rapportProps) as unknown as React.ReactElement
  const pdfBuffer = await renderToBuffer(pdfElement as unknown as Parameters<typeof renderToBuffer>[0])

  const filename = `impactrapport-${gameSession.tour?.name?.replace(/\s+/g, '-').toLowerCase() ?? sessionId}.pdf`

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
