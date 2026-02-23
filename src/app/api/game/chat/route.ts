import { db } from '@/lib/db'
import { gameSessions, teams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { aiComplete } from '@/lib/ai'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(2000),
})

const schema = z.object({
  sessionId: z.string().uuid(),
  teamToken: z.string().min(1),
  message: z.string().min(1).max(1000),
  history: z.array(messageSchema).max(40).default([]),
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

  const { sessionId, teamToken, message, history } = parsed.data

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

  // Chat uitgeschakeld voor jeugdtocht
  if (session.variant === 'jeugdtocht') {
    return NextResponse.json({ error: 'Chat niet beschikbaar voor JeugdTocht' }, { status: 403 })
  }

  // Verifieer team
  const team = await db.query.teams.findFirst({
    where: eq(teams.teamToken, teamToken),
  })

  if (!team || team.gameSessionId !== sessionId) {
    return NextResponse.json({ error: 'Ongeldig team token' }, { status: 401 })
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
  const tourName = session.tour?.name ?? 'ImpactTocht'

  const systemPrompt = isFamily
    ? `Je bent Buddy, de vrolijke ImpactTocht assistent voor gezinnen.
Je helpt ouders en kinderen tijdens de ${tourName}.
Wees vrolijk, eenvoudig en enthousiast. Geef aanmoediging en tips.
Spreek iedereen aan — zowel ouders als kinderen.
Geef NOOIT de antwoorden van opdrachten direct weg — geef hints als ze vastzitten.
Taal: Nederlands. Max 3 zinnen per antwoord.`
    : `Je bent Scout, de slimme ImpactTocht assistent voor teams.
Je helpt het team ${team.name} tijdens de ${tourName}.
Wees behulpzaam, motiverend en professioneel maar toegankelijk.
Geef NOOIT de antwoorden van opdrachten direct weg — geef hints als ze vastzitten.
Je kunt helpen met: vragen over de tocht, teamdynamica, reflectievragen.
Taal: Nederlands. Max 3 zinnen per antwoord.`

  try {
    const reply = await aiComplete([
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ], { maxTokens: 300, temperature: 0.8 })

    return NextResponse.json({ reply, persona: personaName })
  } catch {
    return NextResponse.json({ error: 'AI niet beschikbaar' }, { status: 503 })
  }
}
