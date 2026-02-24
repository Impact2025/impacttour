/**
 * OpenRouter AI client
 * IctusGo gebruikt OpenRouter als AI gateway (niet direct Anthropic API)
 * Default model: anthropic/claude-sonnet-4-6
 *
 * Rate limit: max 20 AI calls per team per sessie (bijgehouden in sessie state)
 */

import OpenAI from 'openai'

// Lazy init — voorkomt build-time crash als OPENROUTER_API_KEY ontbreekt
function getOpenRouter() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'missing',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://impacttocht.nl',
      'X-Title': 'IctusGo',
    },
  })
}

// Zwaar model voor narratieven, tour-generatie en complexe JSON (A, E, F, G)
const DEFAULT_MODEL =
  process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-sonnet-4-6'

// Snel + goedkoop model voor hoog-volume gameplay calls (B, C, C2)
// Haiku is 10-15× goedkoper en sneller voor structured JSON scoring
const FAST_MODEL =
  process.env.OPENROUTER_FAST_MODEL || 'anthropic/claude-haiku-4-5-20251001'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Basis AI completion via OpenRouter */
export async function aiComplete(
  messages: AIMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const response = await getOpenRouter().chat.completions.create({
    model: options?.model ?? DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens ?? 1024,
    temperature: options?.temperature ?? 0.7,
  })

  return response.choices[0]?.message?.content ?? ''
}

/** AI completion met JSON output (forced JSON mode) */
export async function aiCompleteJSON<T = unknown>(
  messages: AIMessage[],
  options?: {
    model?: string
    maxTokens?: number
  }
): Promise<T> {
  const response = await getOpenRouter().chat.completions.create({
    model: options?.model ?? DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens ?? 2048,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content ?? '{}'
  return JSON.parse(content) as T
}

// ─── AI Functie A: Gepersonaliseerde opdrachten genereren ─────────────────────

export interface GenerateAssignmentParams {
  checkpointType: string
  teamSize: number
  variant: 'wijktocht' | 'impactsprint' | 'familietocht' | 'jeugdtocht' | 'voetbalmissie'
  location?: string
  themes?: string[]
}

export async function generateAssignment(
  params: GenerateAssignmentParams
): Promise<{ title: string; description: string }> {
  const variantContext = {
    wijktocht: 'zakelijke teambuilding voor volwassenen',
    impactsprint: 'snelle sprint voor zakelijke teams, max 90 minuten',
    familietocht: 'gezinsactiviteit voor ouders en kinderen',
    jeugdtocht: 'activiteit voor kinderen van 9-13 jaar, eenvoudige taal',
    voetbalmissie: 'GPS speurtocht voor voetbaljongens van 9-12 jaar, voetbal-thema, eenvoudige taal, maatschappelijke impact verborgen in opdrachten',
  }

  const result = await aiCompleteJSON<{ title: string; description: string }>(
    [
      {
        role: 'system',
        content: `Je bent een creatieve spelontwerper voor IctusGo. Genereer een opdracht voor ${variantContext[params.variant]}.
Antwoord ALLEEN in JSON: {"title": "...", "description": "..."}
De opdracht bevordert verbinding, betekenis, plezier en/of groei.
Taal: Nederlands. Max 2 zinnen voor description.`,
      },
      {
        role: 'user',
        content: `Checkpoint type: ${params.checkpointType}
Team grootte: ${params.teamSize} personen
${params.location ? `Locatie: ${params.location}` : ''}
${params.themes?.length ? `Thema's: ${params.themes.join(', ')}` : ''}`,
      },
    ],
    { maxTokens: 256 }
  )

  return result
}

// ─── AI Functie B: Hints systeem 3 niveaus ───────────────────────────────────

export async function generateHints(
  missionTitle: string,
  missionDescription: string
): Promise<{ hint1: string; hint2: string; hint3: string }> {
  return aiCompleteJSON<{ hint1: string; hint2: string; hint3: string }>(
    [
      {
        role: 'system',
        content: `Genereer 3 hints voor een teambuilding opdracht, van vaag naar specifiek.
Antwoord ALLEEN in JSON: {"hint1": "vaagste hint", "hint2": "middelste hint", "hint3": "meest specifieke hint"}
Taal: Nederlands. Elke hint max 1 zin.`,
      },
      {
        role: 'user',
        content: `Opdracht: ${missionTitle}\n${missionDescription}`,
      },
    ],
    { model: FAST_MODEL, maxTokens: 256 }
  )
}

// ─── AI Functie C: Antwoord-evaluatie & scoring ───────────────────────────────

export interface EvaluationResult {
  score: number // 0-100
  feedback: string
  gmsBreakdown: {
    connection: number // 0-25
    meaning: number // 0-25
    joy: number // 0-25
    growth: number // 0-25
  }
  reasoning: string
}

export interface EvaluationParams {
  missionTitle: string
  missionDescription: string
  teamAnswer: string
  variant: string
  missionType: string
  checkpointType: string
  gmsWeights: { connection: number; meaning: number; joy: number; growth: number }
}

export async function evaluateSubmission(
  params: EvaluationParams
): Promise<EvaluationResult> {
  const isKids = params.variant === 'jeugdtocht' || params.variant === 'voetbalmissie'
  const variantLabels: Record<string, string> = {
    wijktocht: 'zakelijke teambuilding voor volwassenen',
    impactsprint: 'snelle sprint voor zakelijke teams',
    familietocht: 'gezinsactiviteit voor ouders en kinderen',
    jeugdtocht: 'kinderen van 9-13 jaar',
    voetbalmissie: 'voetbaljongens van 9-12 jaar',
  }
  const doelgroep = isKids
    ? 'kinderen (wees mild, aanmoedigend en eenvoudig in taal)'
    : (variantLabels[params.variant] ?? params.variant)

  const weightsContext = `Checkpoint nadruk per dimensie (max punten): verbinding ${params.gmsWeights.connection} | betekenis ${params.gmsWeights.meaning} | plezier ${params.gmsWeights.joy} | groei ${params.gmsWeights.growth}`

  return aiCompleteJSON<EvaluationResult>(
    [
      {
        role: 'system',
        content: `Evalueer de inzending van een teambuilding opdracht.
Doelgroep: ${doelgroep}
Type opdracht: ${params.missionType}
Checkpoint type: ${params.checkpointType}
${weightsContext}

Beoordeel op 4 GMS dimensies (elk 0-25 punten). Scoor hoger op dimensies met meer nadruk in dit checkpoint.
${isKids ? 'Wees extra mild — kinderen verdienen aanmoediging.' : ''}

Antwoord ALLEEN in JSON:
{
  "score": 0-100,
  "feedback": "positieve feedback in max 2 zinnen",
  "gmsBreakdown": {"connection": 0-25, "meaning": 0-25, "joy": 0-25, "growth": 0-25},
  "reasoning": "korte uitleg van de beoordeling"
}
Taal: Nederlands. Wees aanmoedigend en constructief.`,
      },
      {
        role: 'user',
        content: `Opdracht: ${params.missionTitle}\n${params.missionDescription}\n\nInzending van het team: ${params.teamAnswer}`,
      },
    ],
    { model: FAST_MODEL, maxTokens: 512 }
  )
}

// ─── AI Functie C2: Coach Insight genereren ───────────────────────────────────

export interface CoachInsightParams {
  teamName: string
  tourName: string
  variant: string
  totalScore: number
  gmsMax: number
  dimensions: { connection: number; meaning: number; joy: number; growth: number }
  dimensionMaxes: { connection: number; meaning: number; joy: number; growth: number }
  checkpointsCompleted: number
  totalCheckpoints: number
}

export async function generateCoachInsight(
  params: CoachInsightParams
): Promise<string> {
  const dimNames = { connection: 'verbinding', meaning: 'betekenis', joy: 'plezier', growth: 'groei' }
  const dimEntries = Object.entries(params.dimensions) as [keyof typeof params.dimensions, number][]
  const withPct = dimEntries.map(([key, val]) => ({
    name: dimNames[key],
    pct: params.dimensionMaxes[key] > 0 ? Math.round((val / params.dimensionMaxes[key]) * 100) : 0,
  }))
  withPct.sort((a, b) => b.pct - a.pct)
  const strongest = withPct[0].name
  const weakest = withPct[withPct.length - 1].name

  const scorePercentage = params.gmsMax > 0 ? Math.round((params.totalScore / params.gmsMax) * 100) : 0

  return aiComplete(
    [
      {
        role: 'system',
        content: `Je bent een empathische teamcoach voor IctusGo.
Schrijf een persoonlijk Coach Inzicht van 3-4 zinnen in het Nederlands.
- Noem de sterkste dimensie (${strongest}) en zwakste dimensie (${weakest}) bij naam.
- Wees concreet en persoonlijk — gebruik de teamnaam.
- Eindig met één concrete, positieve aanbeveling voor de toekomst.
- Max 80 woorden. Geen bulletpoints, geen kopteksten.`,
      },
      {
        role: 'user',
        content: `Team: ${params.teamName}
Tocht: ${params.tourName} (${params.variant})
Score: ${scorePercentage}% (${params.totalScore}/${params.gmsMax} punten)
Checkpoints: ${params.checkpointsCompleted}/${params.totalCheckpoints}
Dimensiescores (% van max):
${withPct.map((d) => `- ${d.name}: ${d.pct}%`).join('\n')}`,
      },
    ],
    { model: FAST_MODEL, maxTokens: 200, temperature: 0.8 }
  )
}

// ─── AI Functie E: Debriefing genereren (400-600 woorden) ────────────────────

export interface DebriefingParams {
  tourName: string
  teamName: string
  totalScore: number
  checkpointsCompleted: number
  totalCheckpoints: number
  gmsBreakdown: {
    connection: number
    meaning: number
    joy: number
    growth: number
  }
  highlights?: string[]
}

export async function generateDebriefing(
  params: DebriefingParams
): Promise<string> {
  return aiComplete(
    [
      {
        role: 'system',
        content: `Je bent een inspirerende debriefing-schrijver voor IctusGo teambuilding sessies.
Schrijf een debriefing van 400-600 woorden in het Nederlands.
Gebruik de naam van het team en hun prestaties. Wees positief, concreet en inspirerend.
Noem de 4 GMS dimensies (verbinding, betekenis, plezier, groei) specifiek.
Eindig met een aanmoediging.`,
      },
      {
        role: 'user',
        content: `Team: ${params.teamName}
Tocht: ${params.tourName}
Score: ${params.totalScore}/100
Checkpoints: ${params.checkpointsCompleted}/${params.totalCheckpoints}
GMS scores:
- Verbinding: ${params.gmsBreakdown.connection}/25
- Betekenis: ${params.gmsBreakdown.meaning}/25
- Plezier: ${params.gmsBreakdown.joy}/25
- Groei: ${params.gmsBreakdown.growth}/25
${params.highlights?.length ? `\nHighlights: ${params.highlights.join(', ')}` : ''}`,
      },
    ],
    { maxTokens: 800, temperature: 0.8 }
  )
}

// ─── AI Functie F: Tocht-generator voor admin ────────────────────────────────

export interface TourGeneratorParams {
  name: string
  variant: 'wijktocht' | 'impactsprint' | 'familietocht' | 'jeugdtocht' | 'voetbalmissie'
  location: string
  teamSize: number
  durationMinutes: number
  themes?: string[]
  checkpointCount?: number
}

export interface GeneratedTour {
  description: string
  checkpoints: Array<{
    name: string
    type: string
    missionTitle: string
    missionDescription: string
    missionType: string
    gmsConnection: number
    gmsMeaning: number
    gmsJoy: number
    gmsGrowth: number
    hint1: string
    hint2: string
    hint3: string
    isKidsFriendly: boolean
    timeLimitSeconds: number | null
    bonusPhotoPoints: number
  }>
}

export async function generateTour(
  params: TourGeneratorParams
): Promise<GeneratedTour> {
  const count = params.checkpointCount ?? (params.variant === 'impactsprint' ? 5 : params.variant === 'voetbalmissie' ? 5 : 8)

  const variantInstruction = params.variant === 'voetbalmissie'
    ? `SPECIALE INSTRUCTIES voor VoetbalMissie:
- Doelgroep: voetbaljongens van 9-12 jaar
- Verhaalframe: "De trainer van jullie club is iets kwijtgeraakt — help hem!"
- Verberg de maatschappelijke laag in de opdrachten (ze merken het pas achteraf)
- Gebruik voetbal-gerelateerde namen en taal (trainer, club, teamgenoten, dribble)
- Checkpoint 1: Verkenner — zoek een aanwijzing (object/QR) in de omgeving
- Checkpoint 2: Teamspeler — spreek een onbekende volwassene aan, maak teamfoto (stel bonusPhotoPoints: 50)
- Checkpoint 3: Dribbelaar — teamwork-uitdaging met beperkingen (mag niet praten, wijzen, etc.)
- Checkpoint 4: Assistent — kleine klus voor iemand in de buurt, maatschappelijke actie (stel timeLimitSeconds: 480)
- Checkpoint 5: Finale — onthulling wat de trainer "kwijt was" (gevoel, niet een voorwerp)
- Gebruik isKidsFriendly: true voor alle checkpoints
- Eenvoudige, enthousiaste taal voor 10-jarigen`
    : params.variant === 'jeugdtocht'
    ? 'Doelgroep kinderen 9-13 jaar. Eenvoudige taal. Alle checkpoints isKidsFriendly: true.'
    : params.variant === 'familietocht'
    ? 'Gezinsactiviteit voor ouders en kinderen samen. Warm en toegankelijk.'
    : params.variant === 'impactsprint'
    ? 'Compact format, snelle opdrachten, zakelijke teams.'
    : 'Zakelijke teambuilding voor volwassenen, maatschappelijke impact.'

  return aiCompleteJSON<GeneratedTour>(
    [
      {
        role: 'system',
        content: `Je bent een expert in het ontwerpen van GPS teambuilding tochten voor IctusGo.
Genereer een complete tocht in JSON formaat.

JSON structuur:
{
  "description": "beschrijving van de tocht",
  "checkpoints": [
    {
      "name": "naam checkpoint",
      "type": "kennismaking|samenwerking|reflectie|actie|feest",
      "missionTitle": "titel van de opdracht",
      "missionDescription": "beschrijving van de opdracht (2-3 zinnen)",
      "missionType": "opdracht|foto|quiz|video",
      "gmsConnection": 0-25,
      "gmsMeaning": 0-25,
      "gmsJoy": 0-25,
      "gmsGrowth": 0-25,
      "hint1": "vage hint",
      "hint2": "middelhint",
      "hint3": "specifieke hint",
      "isKidsFriendly": true|false,
      "timeLimitSeconds": null,
      "bonusPhotoPoints": 0
    }
  ]
}

Regels:
- gmsConnection + gmsMeaning + gmsJoy + gmsGrowth = max 25 elk (maar verdeel realistisch)
- Eerste checkpoint: type "kennismaking"
- Laatste checkpoint: type "feest"
- timeLimitSeconds: null tenzij er een tijdslimiet nodig is (bijv. 480 voor 8 minuten)
- bonusPhotoPoints: 0 tenzij een teamfoto extra punten oplevert (bijv. 50)
- Taal: Nederlands`,
      },
      {
        role: 'user',
        content: `Naam: ${params.name}
Variant: ${params.variant}
Locatie: ${params.location}
Team grootte: ${params.teamSize} personen
Duur: ${params.durationMinutes} minuten
Aantal checkpoints: ${count}
${params.themes?.length ? `Thema's: ${params.themes.join(', ')}` : ''}

${variantInstruction}`,
      },
    ],
    { maxTokens: 4096 }
  )
}

// ─── AI Functie G: Impactrapport narratief ────────────────────────────────────

export async function generateReportNarrative(params: {
  tourName: string
  variant: string
  totalTeams: number
  avgGmsScore: number
  topTeam: string
  gmsBreakdown: { connection: number; meaning: number; joy: number; growth: number }
}): Promise<string> {
  return aiComplete(
    [
      {
        role: 'system',
        content: `Schrijf een impact narratief voor een IctusGo sessie rapport.
200-300 woorden in het Nederlands. Professioneel maar warm van toon.
Beschrijf de collectieve impact van alle teams samen.`,
      },
      {
        role: 'user',
        content: `Tocht: ${params.tourName} (${params.variant})
Aantal teams: ${params.totalTeams}
Gemiddelde GMS score: ${params.avgGmsScore}/100
Best presterende team: ${params.topTeam}
Gemiddelde GMS verdeling:
- Verbinding: ${params.gmsBreakdown.connection}/25
- Betekenis: ${params.gmsBreakdown.meaning}/25
- Plezier: ${params.gmsBreakdown.joy}/25
- Groei: ${params.gmsBreakdown.growth}/25`,
      },
    ],
    { maxTokens: 400, temperature: 0.8 }
  )
}
