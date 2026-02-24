import { db } from '@/lib/db'
import { gameSessions, sessionScores, submissions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateCoachInsight } from '@/lib/ai'

/**
 * GET /api/game/rapport/[sessionId]
 * Geaggregeerde GMS rapport data per team — voor de rapport-pagina.
 * Auth via x-team-token header.
 *
 * Fast path: leest uit session_scores (gedenormaliseerd, incrementeel bijgewerkt door submit route).
 * Fallback: live aggregatie uit submissions (voor sessies die predate session_scores migratie).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const teamToken = req.headers.get('x-team-token')

  if (!teamToken) {
    return NextResponse.json({ error: 'Geen team token' }, { status: 401 })
  }

  // Haal sessie op met tour + checkpoints + teams (zonder submissions — fast path)
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
    with: {
      tour: {
        with: {
          checkpoints: {
            orderBy: (c, { asc }) => [asc(c.orderIndex)],
          },
        },
      },
      teams: {
        orderBy: (t, { desc }) => [desc(t.totalGmsScore)],
      },
    },
  })

  if (!session) {
    return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
  }

  // Zoek het team op token
  const team = session.teams.find((t) => t.teamToken === teamToken)
  if (!team) {
    return NextResponse.json({ error: 'Ongeldig team token' }, { status: 401 })
  }

  const allCheckpoints = session.tour?.checkpoints ?? []

  // GMS max over alle checkpoints
  const gmsMax = allCheckpoints.reduce(
    (sum, cp) => sum + cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth,
    0
  )

  // Dimensie-maxima per dimensie (voor percentages)
  const dimensionMaxes = allCheckpoints.reduce(
    (acc, cp) => ({
      connection: acc.connection + cp.gmsConnection,
      meaning: acc.meaning + cp.gmsMeaning,
      joy: acc.joy + cp.gmsJoy,
      growth: acc.growth + cp.gmsGrowth,
    }),
    { connection: 0, meaning: 0, joy: 0, growth: 0 }
  )

  // ─── Fast path: lees uit session_scores ───────────────────────────────────
  const scoreRow = await db.query.sessionScores.findFirst({
    where: and(
      eq(sessionScores.sessionId, sessionId),
      eq(sessionScores.teamId, team.id)
    ),
  })

  let connection: number
  let meaning: number
  let joy: number
  let growth: number

  type CheckpointScore = { name: string; gmsEarned: number; orderIndex: number }
  let checkpointScores: CheckpointScore[]

  if (scoreRow) {
    // Gedenormaliseerde data — O(1) lookup
    connection = scoreRow.connection
    meaning = scoreRow.meaning
    joy = scoreRow.joy
    growth = scoreRow.growth
    const rawScores = scoreRow.checkpointScores as CheckpointScore[]
    checkpointScores = [...rawScores].sort((a, b) => a.orderIndex - b.orderIndex)
  } else {
    // ─── Fallback: live aggregatie uit submissions ─────────────────────────
    const teamSubmissions = await db.query.submissions.findMany({
      where: eq(submissions.teamId, team.id),
      with: { checkpoint: true },
    })

    connection = 0
    meaning = 0
    joy = 0
    growth = 0
    const rawScores: CheckpointScore[] = []

    for (const sub of teamSubmissions) {
      const evaluation = sub.aiEvaluation as {
        connection?: number
        meaning?: number
        joy?: number
        growth?: number
      } | null

      if (evaluation) {
        connection += evaluation.connection ?? 0
        meaning += evaluation.meaning ?? 0
        joy += evaluation.joy ?? 0
        growth += evaluation.growth ?? 0
      }

      const cp = allCheckpoints.find((c) => c.id === sub.checkpointId)
      rawScores.push({
        name: cp?.name ?? sub.checkpoint?.name ?? 'Checkpoint',
        gmsEarned: sub.gmsEarned,
        orderIndex: cp?.orderIndex ?? 0,
      })
    }

    checkpointScores = rawScores.sort((a, b) => a.orderIndex - b.orderIndex)
  }

  // Rank = positie in scorebord
  const rank = session.teams.findIndex((t) => t.teamToken === teamToken) + 1

  // Dimensie-percentages
  const dimensionPercentages = {
    connection: dimensionMaxes.connection > 0 ? Math.round((connection / dimensionMaxes.connection) * 100) : 0,
    meaning: dimensionMaxes.meaning > 0 ? Math.round((meaning / dimensionMaxes.meaning) * 100) : 0,
    joy: dimensionMaxes.joy > 0 ? Math.round((joy / dimensionMaxes.joy) * 100) : 0,
    growth: dimensionMaxes.growth > 0 ? Math.round((growth / dimensionMaxes.growth) * 100) : 0,
  }

  // Coach inzicht — AI C2 (Haiku model, snel)
  const fallbackInsights: Record<string, string> = {
    verbinding:
      'Jullie team toont een uitzonderlijk sterke verbindingsscore! De manier waarop jullie samenwerken en elkaar ondersteunen bij opdrachten laat echte teamkracht zien. Blijf investeren in die onderlinge verbinding — het is jullie grootste kracht.',
    betekenis:
      'Indrukwekkend! Jullie team geeft diepgaande betekenis aan elke opdracht. Die reflectieve instelling maakt jullie werk niet alleen beter, maar ook rijker. Gebruik dat als fundament voor verdere groei samen.',
    plezier:
      'Jullie energieniveau is aanstekelijk! Het plezier dat jullie uitstralen tijdens de opdrachten creëert een positieve sfeer voor het hele team. Laat die vreugde de drijvende kracht zijn achter alles wat jullie doen.',
    groei:
      'Groei zit in jullie DNA! Elk obstakel wordt door jullie omgezet in een leermogelijkheid. Die groeimindset is de sleutel tot langdurig succes — blijf zo nieuwsgierig en leergierig.',
  }

  const dimEntries = [
    { key: 'verbinding', pct: dimensionPercentages.connection },
    { key: 'betekenis', pct: dimensionPercentages.meaning },
    { key: 'plezier', pct: dimensionPercentages.joy },
    { key: 'groei', pct: dimensionPercentages.growth },
  ]
  const topDim = dimEntries.reduce((max, d) => (d.pct > max.pct ? d : max), dimEntries[0])

  // Coach inzicht — gecached in session_scores.coach_insight
  // Eenmalig genereren (Sonnet); volgende views lezen direct uit DB
  let coachInsight: string

  if (scoreRow?.coachInsight) {
    // Cache hit — geen AI-call nodig
    coachInsight = scoreRow.coachInsight
  } else {
    try {
      coachInsight = await generateCoachInsight({
        teamName: team.name,
        tourName: session.tour?.name ?? '',
        variant: session.variant,
        totalScore: team.totalGmsScore,
        gmsMax: gmsMax || 400,
        dimensions: { connection, meaning, joy, growth },
        dimensionMaxes,
        checkpointsCompleted: checkpointScores.length,
        totalCheckpoints: allCheckpoints.length,
        checkpointScores,
      })
      // Sla op in session_scores voor caching (fire-and-forget)
      if (scoreRow) {
        db.update(sessionScores)
          .set({ coachInsight })
          .where(and(
            eq(sessionScores.sessionId, sessionId),
            eq(sessionScores.teamId, team.id)
          ))
          .catch(() => null)
      }
    } catch {
      coachInsight =
        fallbackInsights[topDim.key] ??
        'Goed gedaan! Jullie team heeft een indrukwekkende prestatie geleverd en punten gescoord op alle dimensies van de Geluksmomenten Score.'
    }
  }

  return NextResponse.json({
    teamName: team.name,
    tourName: session.tour?.name ?? '',
    totalGmsScore: team.totalGmsScore,
    gmsMax: gmsMax || 400,
    rank,
    totalTeams: session.teams.length,
    dimensions: { connection, meaning, joy, growth },
    dimensionMaxes,
    dimensionPercentages,
    checkpointScores: checkpointScores.map(({ name, gmsEarned }) => ({ name, gmsEarned })),
    coachInsight,
  })
}
