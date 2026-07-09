/**
 * OpenRouter AI client
 * IctusGo gebruikt OpenRouter als AI gateway (niet direct Anthropic API)
 * Default model: anthropic/claude-sonnet-4-6
 *
 * Rate limit: max 20 AI calls per team per sessie (bijgehouden in sessie state)
 */

import OpenAI from 'openai'
import { getSiteUrl } from '@/lib/seo/site-url'

// Lazy init — voorkomt build-time crash als OPENROUTER_API_KEY ontbreekt
function getOpenRouter() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'missing',
    defaultHeaders: {
      'HTTP-Referer': getSiteUrl(),
      'X-Title': 'IctusGo',
    },
  })
}

// Zwaar model voor narratieven, tour-generatie en complexe JSON (A, E, F, G)
const DEFAULT_MODEL =
  process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-sonnet-4-6'

// Snel + goedkoop model voor hoog-volume gameplay calls (B, C, C2)
// Haiku is 10-15× goedkoper en sneller voor structured JSON scoring
// OpenRouter model ID formaat: zonder datum-suffix (anders: 404 model not found)
const FAST_MODEL =
  process.env.OPENROUTER_FAST_MODEL || 'anthropic/claude-3-5-haiku'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Extraheer een JSON-object uit een AI-antwoord. Robuust tegen:
 * - markdown code fences (```json ... ```)
 * - omringende proza ("Hier is de JSON: { ... }")
 * Werpt een duidelijke fout als er geen geldig object in zit.
 */
function extractJson<T>(content: string): T {
  // 1. Code fence heeft voorrang
  const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  let candidate = fence ? fence[1].trim() : content.trim()

  // 2. Anders: pak van eerste '{' t/m laatste '}' (negeer omringende tekst)
  if (!fence && !candidate.startsWith('{')) {
    const first = candidate.indexOf('{')
    const last = candidate.lastIndexOf('}')
    if (first !== -1 && last > first) candidate = candidate.slice(first, last + 1)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate)
  } catch {
    throw new Error(`AI gaf geen geldige JSON terug (eerste 120 tekens: ${content.slice(0, 120)})`)
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('AI JSON was geen object')
  }
  return parsed as T
}

/** Basis AI completion via OpenRouter */
export async function aiComplete(
  messages: AIMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    timeoutMs?: number
  }
): Promise<string> {
  const model = options?.model ?? DEFAULT_MODEL
  const t0 = Date.now()
  const response = await getOpenRouter().chat.completions.create({
    model,
    messages,
    max_tokens: options?.maxTokens ?? 1024,
    temperature: options?.temperature ?? 0.7,
  })
  console.log(`[AI] ${model.split('/').pop()} | ${response.usage?.total_tokens ?? '?'}tok | ${Date.now() - t0}ms`)
  return response.choices[0]?.message?.content ?? ''
}

/** AI completion met JSON output (forced JSON mode) */
export async function aiCompleteJSON<T = unknown>(
  messages: AIMessage[],
  options?: {
    model?: string
    maxTokens?: number
    timeoutMs?: number
  }
): Promise<T> {
  const model = options?.model ?? DEFAULT_MODEL

  async function attempt(m: string): Promise<T> {
    const t0 = Date.now()
    const response = await getOpenRouter().chat.completions.create({
      model: m,
      messages,
      max_tokens: options?.maxTokens ?? 2048,
      temperature: 0.7,
    })
    console.log(`[AI] ${m.split('/').pop()} | ${response.usage?.total_tokens ?? '?'}tok | ${Date.now() - t0}ms`)
    const content = response.choices[0]?.message?.content ?? '{}'
    return extractJson<T>(content)
  }

  try {
    return await attempt(model)
  } catch (err) {
    // Als fast model faalt (verkeerd ID, unavailable), val terug op default model
    if (model !== DEFAULT_MODEL) {
      console.error(`[AI] Model "${model}" gefaald, retry met "${DEFAULT_MODEL}":`, err instanceof Error ? err.message : err)
      return await attempt(DEFAULT_MODEL)
    }
    throw err
  }
}

// ─── AI Functie A: Gepersonaliseerde opdrachten genereren ─────────────────────

export interface GenerateAssignmentParams {
  checkpointType: string
  teamSize: number
  variant: 'wijktocht' | 'impactsprint' | 'familietocht' | 'jeugdtocht' | 'voetbalmissie' | 'vrijwilligersdankdag'
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
    vrijwilligersdankdag: 'erkennings- en impacttocht voor volwassen vrijwilligers, warme toon, thema\'s: erkenning, verbinding, betekenis, plezier, groei',
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
        content: `Genereer 3 progressieve hints voor een teambuilding opdracht. Elke hint bouwt op de vorige.

Niveaus (strikt volgen):
- hint1 (VAAG): Noem het onderwerp NIET direct. Geef een gevoel, thema of filosofische richting. Bijv: "Denk aan wat mensen verbindt op drukke plekken." of "Kijk naar wat anderen over het hoofd zien."
- hint2 (MIDDEL): Vernauw naar de omgeving of handeling zonder het exacte antwoord te geven. Bijv: "Zoek iets wat normaal onzichtbaar is, maar iedereen dagelijks passeert." of "De sleutel zit in een alledaagse actie die niemand opvalt."
- hint3 (SPECIFIEK): Geef een directe aanwijzing die naar de oplossing leidt zonder hem weg te geven. Bijv: "Loop naar de ingang van het gebouw en kijk omhoog." of "Spreek de persoon aan die het meest bezig lijkt."

Regels:
- Elke hint is max 1-2 zinnen
- De drie hints vormen een logisch opbouwende keten
- hint3 mag nooit het antwoord prijsgeven — alleen de weg ernaar toe
- Taal: Nederlands

Antwoord ALLEEN in JSON: {"hint1": "...", "hint2": "...", "hint3": "..."}`,
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

Scoringsanchors (gebruik als richtlijn per dimensie):
- 0-6 punten: Minimale inspanning, oppervlakkig of nauwelijks relevant voor de opdracht
- 7-12 punten: Basisinspanning, enige reflectie maar weinig diepgang
- 13-19 punten: Goede inzet, authentiek antwoord met merkbare betrokkenheid
- 20-25 punten: Uitzonderlijk — origineel, diep en raakt de essentie van de dimensie
${isKids ? '\nWees extra mild — kinderen verdienen aanmoediging. Scoor minimaal 10/25 per dimensie bij een serieuze poging.' : ''}

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
  checkpointScores?: { name: string; gmsEarned: number }[]
  teamSize?: number
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
  const strongest = withPct[0]
  const weakest   = withPct[withPct.length - 1]

  const scorePercentage = params.gmsMax > 0 ? Math.round((params.totalScore / params.gmsMax) * 100) : 0

  // Checkpoint trend analyse
  const scores = params.checkpointScores ?? []
  let trend = 'stabiel'
  if (scores.length >= 2) {
    const last  = scores[scores.length - 1].gmsEarned
    const first = scores[0].gmsEarned
    if (last > first * 1.1) trend = 'stijgend'
    else if (last < first * 0.9) trend = 'dalend'
  }
  const bestCp   = scores.length ? scores.reduce((a, b) => a.gmsEarned >= b.gmsEarned ? a : b) : null
  const worstCp  = scores.length ? scores.reduce((a, b) => a.gmsEarned <= b.gmsEarned ? a : b) : null

  return aiComplete(
    [
      {
        role: 'system',
        content: `Je bent een empathische, scherpe teamcoach voor IctusGo GPS teambuilding.
Schrijf een persoonlijk Coach Inzicht in 4 alinea's (totaal 400-500 woorden) in het Nederlands.

Structuur:
1. **Opening** — persoonlijk, team-specifiek, 2 warme zinnen die de totaalervaring vatten.
2. **Sterkste moment** — noem het beste checkpoint bij naam (${bestCp?.name ?? 'onbekend'}), leg uit waarom die dimensie (${strongest.name} · ${strongest.pct}%) zo sterk was voor dit team.
3. **Groeirichting** — de laagste dimensie (${weakest.name} · ${weakest.pct}%) concreet bespreken: wat hield het team terug en hoe kunnen ze dit praktisch verbeteren?
4. **Uitdaging + afsluiting** — één specifieke uitdaging voor een volgende tocht, eindig energiek en uitnodigend.

Regels:
- Gebruik altijd de teamnaam.
- Geen bulletpoints, geen kopteksten, geen markdown.
- Scoreontwikkeling was ${trend} — reflecteer dit subtiel.
- Schrijf in de tweede persoon (jullie / jij).`,
      },
      {
        role: 'user',
        content: `Team: ${params.teamName}
Tocht: ${params.tourName} (${params.variant})
Score: ${scorePercentage}% (${params.totalScore}/${params.gmsMax} punten)
Checkpoints voltooid: ${params.checkpointsCompleted}/${params.totalCheckpoints}
${params.teamSize ? `Teamgrootte: ${params.teamSize} personen` : ''}
Scoreontwikkeling: ${trend}
Beste checkpoint: ${bestCp ? `${bestCp.name} (${bestCp.gmsEarned} pt)` : 'onbekend'}
Lastigste checkpoint: ${worstCp ? `${worstCp.name} (${worstCp.gmsEarned} pt)` : 'onbekend'}

Dimensiescores (% van max):
${withPct.map((d) => `- ${d.name}: ${d.pct}%`).join('\n')}`,
      },
    ],
    { model: DEFAULT_MODEL, maxTokens: 700, temperature: 0.85 }
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
  const dimMap = [
    { name: 'verbinding', val: params.gmsBreakdown.connection },
    { name: 'betekenis', val: params.gmsBreakdown.meaning },
    { name: 'plezier', val: params.gmsBreakdown.joy },
    { name: 'groei', val: params.gmsBreakdown.growth },
  ].sort((a, b) => b.val - a.val)
  const strongest = dimMap[0]
  const weakest = dimMap[dimMap.length - 1]

  return aiComplete(
    [
      {
        role: 'system',
        content: `Je bent een inspirerende debriefing-schrijver voor IctusGo teambuilding.
Schrijf een persoonlijke debriefing van 400-600 woorden in het Nederlands voor team ${params.teamName}.

Structuur (4 alinea's, geen kopteksten, geen bulletpoints, geen markdown):
1. OPENING — Noem het team bij naam. 2-3 warme zinnen die de kern van de ervaring vatten. Verbind hun totaalscore (${params.totalScore}/100) met de sfeer die ze meebrachten. Wees specifiek, niet generiek.
2. STERKSTE MOMENT — Bespreek ${strongest.name} (${strongest.val}/25 punten — hoogste dimensie). Leg concreet uit wat dit zegt over dit team: hoe gedroegen ze zich, welke keuzes maakten ze, wat maakt hen bijzonder op dit vlak?
3. GROEIPUNT — Bespreek ${weakest.name} (${weakest.val}/25 — laagste dimensie) eerlijk maar constructief. Wat hield hen terug? Geef één concreet, uitvoerbaar advies voor de volgende keer.
4. AFSLUITING — Eindig met energie. Stel één uitdagende vraag voor de komende weken (begin met "Hoe neem je...?" of "Wat als jullie...?"). Sluit af met een warme aanmoediging — geen clichés als "geweldig gedaan" of "super prestatie".

Schrijfstijl:
- Tweede persoon (jullie / je team)
- Professioneel maar warm — als een goede coach, niet een PR-tekst
- Geen platitudes — wees concreet en eerlijk waar verdiend`,
      },
      {
        role: 'user',
        content: `Team: ${params.teamName}
Tocht: ${params.tourName}
Totaalscore: ${params.totalScore}/100
Checkpoints voltooid: ${params.checkpointsCompleted}/${params.totalCheckpoints}
GMS scores:
- Verbinding: ${params.gmsBreakdown.connection}/25
- Betekenis: ${params.gmsBreakdown.meaning}/25
- Plezier: ${params.gmsBreakdown.joy}/25
- Groei: ${params.gmsBreakdown.growth}/25
Sterkste dimensie: ${strongest.name} (${strongest.val}/25)
Zwakste dimensie: ${weakest.name} (${weakest.val}/25)
${params.highlights?.length ? `\nHighlights: ${params.highlights.join(', ')}` : ''}`,
      },
    ],
    { maxTokens: 800, temperature: 0.8 }
  )
}

// ─── AI Functie F: Tocht-generator voor admin ────────────────────────────────

export interface TourGeneratorParams {
  name: string
  variant: 'wijktocht' | 'impactsprint' | 'familietocht' | 'jeugdtocht' | 'voetbalmissie' | 'vrijwilligersdankdag'
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
    ? `Doelgroep: gezinnen én koppels. Warm, toegankelijk en verbindend.
VERPLICHT: minimaal 1 checkpoint waarbij deelnemers iets doen VOOR of MET een onbekende buiten hun groep:
- Geef een compliment aan een voorbijganger
- Vraag iemand om een foto te maken en leer hun naam
- Doe een kleine vriendelijkheid voor een buurtbewoner
- Koop iets voor de volgende persoon in de rij
Dit maakt de GMS impact-claim eerlijk: verbinding gaat ook naar buiten de eigen groep.`
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
  const dimMap = [
    { name: 'verbinding', val: params.gmsBreakdown.connection },
    { name: 'betekenis', val: params.gmsBreakdown.meaning },
    { name: 'plezier', val: params.gmsBreakdown.joy },
    { name: 'groei', val: params.gmsBreakdown.growth },
  ].sort((a, b) => b.val - a.val)
  const strongest = dimMap[0]
  const weakest = dimMap[dimMap.length - 1]

  return aiComplete(
    [
      {
        role: 'system',
        content: `Je schrijft de openingsparagraaf van een professioneel IctusGo-sessie rapport voor een opdrachtgever.

Structuur (3 alinea's, 200-300 woorden totaal, geen kopteksten, geen bulletpoints):
1. IMPACT SNAPSHOT — Vertaal de sessiecijfers naar menselijk gedrag. Wat zag je écht gebeuren bij ${params.totalTeams} teams? Maak de data concreet: welk collectief gedrag verbergt zich achter een gemiddelde GMS van ${params.avgGmsScore}/100?
2. DIMENSIE-NARRATIEF — Bespreek "${strongest.name}" als de sterkste collectieve kracht (${strongest.val}/25 gemiddeld) én "${weakest.name}" als het aandachtspunt (${weakest.val}/25). Wat zeggen deze scores over de cultuur van de organisatie — verder dan de activiteit zelf?
3. AANBEVELING — Geef één concrete, uitvoerbare aanbeveling voor de opdrachtgever gericht op de zwakste dimensie. Begin met een werkwoord ("Investeer in...", "Daag teams uit om...", "Organiseer...").

Toon: Professioneel en data-gedreven, maar menselijk. Schrijf als een ervaren OD-consultant met gevoel voor mensen. Geen jargon. Geen lege lof.
Taal: Nederlands.`,
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
- Groei: ${params.gmsBreakdown.growth}/25
Sterkste dimensie: ${strongest.name} (${strongest.val}/25)
Aandachtspunt: ${weakest.name} (${weakest.val}/25)`,
      },
    ],
    { maxTokens: 450, temperature: 0.75 }
  )
}
