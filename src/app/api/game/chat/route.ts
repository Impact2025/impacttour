import { db } from '@/lib/db'
import { gameSessions, teams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { aiComplete } from '@/lib/ai'
import { checkRateLimit, getClientIp, checkOrigin } from '@/lib/rate-limit'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(2000),
})

const schema = z.object({
  sessionId: z.string().uuid(),
  teamToken: z.string().min(1),
  message: z.string().min(1).max(1000),
  history: z.array(messageSchema).max(40).default([]),
  currentCheckpointName: z.string().max(100).optional(),
  currentMissionTitle: z.string().max(200).optional(),
  teamScore: z.number().int().min(0).optional(),
})

/**
 * POST /api/game/chat
 * AI chat assistent voor teams (Functie D).
 * Uitgeschakeld voor JeugdTocht (Flits gebruikt alleen hint-knoppen).
 * Persona: Scout (zakelijk/sprint), Buddy (familie)
 * Rate limit: max 20 exchanges (40 berichten) per team per sessie.
 */
export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { sessionId, teamToken, message, history, currentCheckpointName, currentMissionTitle, teamScore } = parsed.data

  if (!checkOrigin(req)) {
    return NextResponse.json({ error: 'Verboden' }, { status: 403 })
  }

  // Haal sessie op
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
    with: {
      tour: { columns: { name: true, variant: true } },
    },
  })

  if (!session || session.status !== 'active') {
    return NextResponse.json({ error: 'Sessie niet actief' }, { status: 400 })
  }

  // Chat uitgeschakeld voor kids-varianten (hint-knoppen only)
  if (session.variant === 'jeugdtocht' || session.variant === 'voetbalmissie') {
    return NextResponse.json({ error: 'Chat niet beschikbaar voor deze variant' }, { status: 403 })
  }

  // Verifieer team
  const team = await db.query.teams.findFirst({
    where: eq(teams.teamToken, teamToken),
  })

  if (!team || team.gameSessionId !== sessionId) {
    return NextResponse.json({ error: 'Ongeldig team token' }, { status: 401 })
  }

  // Rate limit: max 20 chat-berichten per IP per minuut (extra bescherming naast history-limiet)
  if (!(await checkRateLimit(`chat:${getClientIp(req)}`, 20, 60_000))) {
    return NextResponse.json({ error: 'Te veel chat-verzoeken. Wacht even.' }, { status: 429 })
  }

  // Rate limit: max 40 berichten in history (= 20 heen-en-weer)
  if (history.length >= 40) {
    return NextResponse.json({
      error: 'Chat limiet bereikt voor deze sessie',
      reply: 'Jullie hebben de maximale chatlimiet bereikt voor deze sessie. Succes met de tocht!',
    })
  }

  // Bepaal persona op basis van variant
  const isFamily = session.variant === 'familietocht'
  const personaName = isFamily ? 'Buddy' : 'Scout'
  const tourName = session.tour?.name ?? 'IctusGo'

  // Live context — maakt de AI-coach specifiek in plaats van generiek
  const contextBlock = [
    currentCheckpointName && `Huidige checkpoint: "${currentCheckpointName}"`,
    currentMissionTitle   && `Huidige opdracht: "${currentMissionTitle}"`,
    teamScore !== undefined && `Teamscore tot nu toe: ${teamScore} GMS`,
  ].filter(Boolean).join('\n')

  const contextSection = contextBlock
    ? `\n\nHUIDIGE CONTEXT (gebruik dit als je helpt — wees specifiek):\n${contextBlock}`
    : ''

  const systemPrompt = isFamily
    ? `Je bent Buddy — warm, vrolijk en toegankelijk voor gezinnen tijdens IctusGo.
Je helpt iedereen tijdens de "${tourName}".

GEDRAG: Eenvoudige, heldere taal. Max 3 zinnen. Kinderen begrijpen je ook.
Bij vastlopen: geef een richting, nooit het antwoord. Zeg "Denk aan..." of "Kijk eens bij..."
Wees enthousiast maar niet overdreven — geen uitroeptekens bij elk antwoord.

JE HELPT MET: vragen over de tocht, samen iets ontdekken, aanmoediging bij tegenslagen.
JE PRAAT NOOIT OVER: volwassen of gevoelige onderwerpen, politiek, technische problemen (verwijs naar de spelleider).
Taal: Nederlands.${contextSection}`
    : `Je bent Scout — scherp, motiverend en direct als een goede sportcoach.
Je helpt team "${team.name}" tijdens de "${tourName}".

GEDRAG: Warm maar direct. Max 3 zinnen per antwoord. Geen lange verhalen.
Motiveer zonder te overdrijven: geen "geweldig!", wel "Goed idee — probeer het!"
Bij vastlopen: geef een richting, nooit het antwoord. Stel soms een vraag terug: "Waarom denken jullie dat?"

JE HELPT MET: vragen over de tocht, teamdynamica, reflectievragen, aanmoediging bij tegenslagen.
JE PRAAT NOOIT OVER: politiek, persoonlijke info van teamleden, scores van andere teams, technische problemen (verwijs naar de spelleider).
Taal: Nederlands.${contextSection}`

  const remaining = 40 - history.length - 1

  try {
    const reply = await aiComplete([
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ], { maxTokens: 300, temperature: 0.8 })

    return NextResponse.json({ reply, persona: personaName, remaining })
  } catch (err) {
    console.error('[chat] AI fout:', err instanceof Error ? err.message : err)
    const fallback = isFamily
      ? 'Even geen verbinding met Buddy. Probeer het zo opnieuw!'
      : `Scout is even offline. Probeer het zo opnieuw, ${team.name}!`
    return NextResponse.json({ reply: fallback, persona: personaName, remaining })
  }
}
