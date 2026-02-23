import { db } from '@/lib/db'
import { gameSessions, teams, checkpoints, submissions, sessionScores } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { evaluateSubmission } from '@/lib/ai'
import { broadcastScoreUpdate } from '@/lib/pusher'

const schema = z.object({
  sessionId: z.string().uuid(),
  teamToken: z.string().min(1),
  checkpointId: z.string().uuid(),
  answer: z.string().min(1).max(2000).optional(),
  photoUrl: z.string().url().optional(),
})

/**
 * POST /api/game/submit
 * Team dient missie-antwoord in voor een checkpoint.
 * AI evalueert het antwoord en kent GMS punten toe.
 * Rate limit: max 20 AI calls per team per sessie (bijgehouden via submission count).
 */
export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { sessionId, teamToken, checkpointId, answer, photoUrl } = parsed.data

  if (!answer && !photoUrl) {
    return NextResponse.json({ error: 'Geen antwoord of foto opgegeven' }, { status: 400 })
  }

  // Haal team en sessie op
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

  // Haal checkpoint op
  const checkpoint = await db.query.checkpoints.findFirst({
    where: and(
      eq(checkpoints.id, checkpointId),
      eq(checkpoints.tourId, session.tourId)
    ),
  })

  if (!checkpoint) {
    return NextResponse.json({ error: 'Checkpoint niet gevonden' }, { status: 404 })
  }

  // Controleer of checkpoint al eerder ingediend is
  const existing = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.teamId, team.id),
      eq(submissions.checkpointId, checkpointId)
    ),
  })

  if (existing) {
    return NextResponse.json({ error: 'Al ingediend voor dit checkpoint' }, { status: 400 })
  }

  // Debounce: voorkom dubbele inzendingen binnen 5 seconden (bijv. door dubbelklik of offline sync)
  const recentSubmission = await db.query.submissions.findFirst({
    where: eq(submissions.teamId, team.id),
    orderBy: [desc(submissions.submittedAt)],
  })
  if (recentSubmission) {
    const secondsSinceLastSubmit =
      (Date.now() - new Date(recentSubmission.submittedAt).getTime()) / 1000
    if (secondsSinceLastSubmit < 5) {
      return NextResponse.json(
        { error: 'Te snel achter elkaar ingediend. Wacht even.' },
        { status: 429 }
      )
    }
  }

  // Rate limit: max 20 AI calls per team
  const teamSubmissions = await db.query.submissions.findMany({
    where: eq(submissions.teamId, team.id),
  })

  // Kids-varianten: foto's worden na 30 dagen verwijderd
  const isKidsVariant = session.variant === 'jeugdtocht' || session.variant === 'voetbalmissie'
  const scheduledDeleteAt =
    isKidsVariant && photoUrl ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null

  // Bonus punten bij foto-inzending (bijv. checkpoint 2 van VoetbalMissie)
  const bonusFromPhoto = photoUrl && checkpoint.bonusPhotoPoints > 0 ? checkpoint.bonusPhotoPoints : 0

  const FALLBACK_FACTOR = 0.6

  if (teamSubmissions.length >= 20) {
    // Zonder AI: proportionele fallback op basis van checkpoint-configuratie
    const connectionEarned = Math.round(checkpoint.gmsConnection * FALLBACK_FACTOR)
    const meaningEarned = Math.round(checkpoint.gmsMeaning * FALLBACK_FACTOR)
    const joyEarned = Math.round(checkpoint.gmsJoy * FALLBACK_FACTOR)
    const growthEarned = Math.round(checkpoint.gmsGrowth * FALLBACK_FACTOR)
    const baseGms = connectionEarned + meaningEarned + joyEarned + growthEarned

    const [submission] = await db
      .insert(submissions)
      .values({
        teamId: team.id,
        checkpointId,
        answer,
        photoUrl,
        status: 'approved',
        aiScore: 60,
        aiFeedback: 'Goede inzending! (AI limiet bereikt, basisbeoordeling gegeven)',
        aiEvaluation: {
          connection: connectionEarned,
          meaning: meaningEarned,
          joy: joyEarned,
          growth: growthEarned,
          rawScore: 60,
          reasoning: 'Automatische basisbeoordeling (AI limiet bereikt)',
        },
        gmsEarned: baseGms,
        scheduledDeleteAt,
      })
      .returning()

    await db
      .update(teams)
      .set({
        totalGmsScore: team.totalGmsScore + baseGms,
        bonusPoints: team.bonusPoints + bonusFromPhoto,
      })
      .where(eq(teams.id, team.id))

    // Upsert gedenormaliseerde sessie-scores (voor snel rapport)
    const cpScore = JSON.stringify([{ name: checkpoint.name, gmsEarned: baseGms, orderIndex: checkpoint.orderIndex }])
    await db.insert(sessionScores).values({
      sessionId,
      teamId: team.id,
      connection: connectionEarned,
      meaning: meaningEarned,
      joy: joyEarned,
      growth: growthEarned,
      totalGms: baseGms,
      checkpointsCount: 1,
      checkpointScores: [{ name: checkpoint.name, gmsEarned: baseGms, orderIndex: checkpoint.orderIndex }],
    }).onConflictDoUpdate({
      target: [sessionScores.sessionId, sessionScores.teamId],
      set: {
        connection: sql`${sessionScores.connection} + ${connectionEarned}`,
        meaning: sql`${sessionScores.meaning} + ${meaningEarned}`,
        joy: sql`${sessionScores.joy} + ${joyEarned}`,
        growth: sql`${sessionScores.growth} + ${growthEarned}`,
        totalGms: sql`${sessionScores.totalGms} + ${baseGms}`,
        checkpointsCount: sql`${sessionScores.checkpointsCount} + 1`,
        checkpointScores: sql`${sessionScores.checkpointScores} || ${cpScore}::jsonb`,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      submission: {
        id: submission.id,
        aiScore: 60,
        aiFeedback: submission.aiFeedback,
        gmsEarned: baseGms,
        bonusEarned: bonusFromPhoto,
      },
    })
  }

  // AI evaluatie (Functie C) — met rijke context
  const evaluation = await evaluateSubmission({
    missionTitle: checkpoint.missionTitle,
    missionDescription: checkpoint.missionDescription,
    teamAnswer: answer ?? `[Foto ingediend: ${photoUrl}]`,
    variant: session.variant,
    missionType: checkpoint.missionType,
    checkpointType: checkpoint.type,
    gmsWeights: {
      connection: checkpoint.gmsConnection,
      meaning: checkpoint.gmsMeaning,
      joy: checkpoint.gmsJoy,
      growth: checkpoint.gmsGrowth,
    },
  })

  // Dimensie-gewogen scoring: AI-scores (0-25) × checkpoint-gewichten
  const connectionEarned = Math.round((evaluation.gmsBreakdown.connection / 25) * checkpoint.gmsConnection)
  const meaningEarned = Math.round((evaluation.gmsBreakdown.meaning / 25) * checkpoint.gmsMeaning)
  const joyEarned = Math.round((evaluation.gmsBreakdown.joy / 25) * checkpoint.gmsJoy)
  const growthEarned = Math.round((evaluation.gmsBreakdown.growth / 25) * checkpoint.gmsGrowth)
  const gmsEarned = connectionEarned + meaningEarned + joyEarned + growthEarned

  // Sla submission op met earned waarden (niet raw AI scores)
  const [submission] = await db
    .insert(submissions)
    .values({
      teamId: team.id,
      checkpointId,
      answer,
      photoUrl,
      status: 'approved',
      aiScore: evaluation.score,
      aiFeedback: evaluation.feedback,
      aiEvaluation: {
        connection: connectionEarned,
        meaning: meaningEarned,
        joy: joyEarned,
        growth: growthEarned,
        rawScore: evaluation.score,
        reasoning: evaluation.reasoning,
      },
      gmsEarned,
      scheduledDeleteAt,
    })
    .returning()

  // Update team score + bonus punten
  const newTotalScore = team.totalGmsScore + gmsEarned
  await db
    .update(teams)
    .set({
      totalGmsScore: newTotalScore,
      bonusPoints: team.bonusPoints + bonusFromPhoto,
    })
    .where(eq(teams.id, team.id))

  // Broadcast score update naar scorebord (optioneel — niet blokkerend)
  broadcastScoreUpdate(sessionId, {
    teamId: team.id,
    teamName: team.name,
    totalGmsScore: newTotalScore,
  }).catch(() => null)

  // Upsert gedenormaliseerde sessie-scores (voor snel rapport)
  const cpScore = JSON.stringify([{ name: checkpoint.name, gmsEarned, orderIndex: checkpoint.orderIndex }])
  await db.insert(sessionScores).values({
    sessionId,
    teamId: team.id,
    connection: connectionEarned,
    meaning: meaningEarned,
    joy: joyEarned,
    growth: growthEarned,
    totalGms: gmsEarned,
    checkpointsCount: 1,
    checkpointScores: [{ name: checkpoint.name, gmsEarned, orderIndex: checkpoint.orderIndex }],
  }).onConflictDoUpdate({
    target: [sessionScores.sessionId, sessionScores.teamId],
    set: {
      connection: sql`${sessionScores.connection} + ${connectionEarned}`,
      meaning: sql`${sessionScores.meaning} + ${meaningEarned}`,
      joy: sql`${sessionScores.joy} + ${joyEarned}`,
      growth: sql`${sessionScores.growth} + ${growthEarned}`,
      totalGms: sql`${sessionScores.totalGms} + ${gmsEarned}`,
      checkpointsCount: sql`${sessionScores.checkpointsCount} + 1`,
      checkpointScores: sql`${sessionScores.checkpointScores} || ${cpScore}::jsonb`,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({
    submission: {
      id: submission.id,
      aiScore: evaluation.score,
      aiFeedback: evaluation.feedback,
      gmsBreakdown: evaluation.gmsBreakdown,
      gmsEarned,
      bonusEarned: bonusFromPhoto,
    },
  })
}
