/**
 * Genereer PDF impactrapport v2 voor Amsterdam demo sessie AMST24.
 * Slaat op als: impactrapport-amsterdam.pdf
 *
 * Uitvoeren: bunx tsx scripts/generate-pdf-amsterdam.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import type { RapportProps } from '../src/lib/pdf/impact-rapport'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const MODEL = process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-sonnet-4-6'

async function generateNarrative(params: {
  tourName: string; totalTeams: number; totalParticipants: number
  avgGmsPct: number; topTeam: string
  gmsBreakdownPct: { connection: number; meaning: number; joy: number; growth: number }
}): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://impacttocht.nl',
    },
    body: JSON.stringify({
      model: MODEL, max_tokens: 500, temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `Je schrijft het Impact Narratief voor een IctusGo teambuilding rapport voor een manager/HR-opdrachtgever.
Schrijf 2 alinea's (200-250 woorden). Zakelijk, warm, resultaatgericht. Geen kopteksten, geen bullets.
Eindig met één concrete ROI-observatie over samenwerking of betrokkenheid.`,
        },
        {
          role: 'user',
          content: `Tocht: ${params.tourName} door Amsterdam (Begijnhof → Nieuwmarkt → Waterlooplein → Hortus Botanicus → Oosterpark)
${params.totalTeams} teams, ${params.totalParticipants} deelnemers, gem. GMS: ${params.avgGmsPct}% (benchmark: 65%)
Winnend team: ${params.topTeam}
Dimensiepercentages: Verbinding ${params.gmsBreakdownPct.connection}% · Betekenis ${params.gmsBreakdownPct.meaning}% · Plezier ${params.gmsBreakdownPct.joy}% · Groei ${params.gmsBreakdownPct.growth}%`,
        },
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content.trim()
}

function buildRecommendations(
  breakdown: { connection: number; meaning: number; joy: number; growth: number },
  maxes: { connection: number; meaning: number; joy: number; growth: number }
): RapportProps['recommendations'] {
  const dims = [
    {
      key: 'connection' as const,
      label: 'Verbinding',
      action: 'Organiseer een maandelijkse "verbindingsronde" van 10 minuten in het teamoverleg — elk teamlid deelt iets wat niet over werk gaat.',
      whyLow:  'De score wijst op beperkte persoonlijke uitwisseling tijdens de opdrachten. Teams die lager scoren op verbinding, werken effectiever wanneer er structurele momenten zijn voor informeel contact.',
      whyHigh: 'Jullie team scoort sterk op persoonlijke verbinding. Dit is de basis voor psychologische veiligheid — koester dit door reguliere informele check-ins te behouden.',
    },
    {
      key: 'meaning' as const,
      label: 'Betekenis',
      action: 'Koppel teamdoelen expliciet aan maatschappelijke impact: bespreek kwartaaldoelen altijd met de vraag "waarom doet dit ertoe voor mensen buiten ons bedrijf?".',
      whyLow:  'Teams die lager scoren op betekenis hebben baat bij expliciete verbinding tussen hun werk en een breder doel. Overweeg een intern "impact-project" van één dag per kwartaal.',
      whyHigh: 'Een hoge betekenisscore wijst op intrinsieke motivatie. Gebruik dit door medewerkers ownership te geven over sociale initiatieven in de organisatie.',
    },
    {
      key: 'joy' as const,
      label: 'Plezier',
      action: 'Voeg bij de volgende tocht bewust luchtige elementen toe: een creatieve bonusopdracht of een "wildcard" checkpoint zonder puntentelling maar met maximale speelsheid.',
      whyLow:  'Een lagere pleziersscore duidt op te veel prestatiegericht denken. Spreek vooraf af wie de "sfeermaker" is — iemand die bewust de toon zet als het te serieus wordt.',
      whyHigh: 'Jullie team weet plezier te combineren met inhoud — een zeldzame kwaliteit. Zorg dat nieuwe teamleden ook snel dit gevoel meekrijgen door hen vroeg in te betrekken bij informele activiteiten.',
    },
    {
      key: 'growth' as const,
      label: 'Groei',
      action: 'Plan een follow-up sessie van 2 uur waarbij teams bewust rollen wisselen: wie normaal leidt, voert uit — en vice versa. Dit stimuleert groei direct.',
      whyLow:  'Groei scoort het laagst, wat betekent dat teamleden weinig buiten hun comfortzone zijn getreden. Dit is de meest concrete hefboom voor verbetering.',
      whyHigh: 'De groeiscore toont dat jullie team open staat voor nieuwe ervaringen en leren. Versterk dit door formele leer-momenten (peer feedback, reflectiesessies) toe te voegen aan de teamroutine.',
    },
  ]

  return dims
    .map(d => {
      const score = breakdown[d.key]
      const max   = maxes[d.key]
      const pct   = Math.round((score / max) * 100)
      const isLow = pct < 75
      return {
        label:  d.label,
        score,
        maxScore: max,
        pct,
        action: d.action,
        why: isLow ? d.whyLow : d.whyHigh,
      }
    })
    .sort((a, b) => a.pct - b.pct) // laagste score eerst
}

async function main() {
  console.log('\n📄 Genereer PDF v2 voor Amsterdam demo sessie AMST24...\n')

  // 1. Zet sessie op completed
  const [session] = await sql`
    UPDATE game_sessions SET status = 'completed'
    WHERE join_code = 'AMST24'
    RETURNING id, tour_id, created_at, started_at, variant, organization_name
  `
  if (!session) throw new Error('Sessie AMST24 niet gevonden')
  console.log('✓ Sessie status → completed')

  // 2. Teams + session_scores (dimensies per team)
  const rows = await sql`
    SELECT
      t.id, t.name, t.total_gms_score, t.team_token,
      ss.connection, ss.meaning, ss.joy, ss.growth
    FROM teams t
    JOIN session_scores ss ON ss.team_id = t.id AND ss.session_id = ${session.id as string}
    ORDER BY t.total_gms_score DESC
  `

  // 3. Submissions per team tellen (betrouwbaarder dan completed_checkpoints)
  const submissionCounts = await sql`
    SELECT team_id, COUNT(*) AS cnt
    FROM submissions
    WHERE team_id IN (
      SELECT id FROM teams WHERE game_session_id = ${session.id as string}
    )
    GROUP BY team_id
  `
  const subMap = Object.fromEntries(submissionCounts.map(r => [r.team_id as string, Number(r.cnt)]))

  // 4. Checkpoints
  const checkpoints = await sql`
    SELECT gms_connection, gms_meaning, gms_joy, gms_growth
    FROM checkpoints WHERE tour_id = ${session.tour_id as string}
  `
  const totalCheckpoints = checkpoints.length

  // 5. Dimensie-maxima
  const dimensionMaxes = {
    connection: checkpoints.reduce((s, c) => s + (c.gms_connection as number), 0),
    meaning:    checkpoints.reduce((s, c) => s + (c.gms_meaning   as number), 0),
    joy:        checkpoints.reduce((s, c) => s + (c.gms_joy       as number), 0),
    growth:     checkpoints.reduce((s, c) => s + (c.gms_growth    as number), 0),
  }
  const gmsMax = dimensionMaxes.connection + dimensionMaxes.meaning + dimensionMaxes.joy + dimensionMaxes.growth

  // 6. Team-scores bouwen
  const MEMBERS: Record<string, number> = {
    'token-ams-jordaan-01': 6,
    'token-ams-depijp-02':  5,
    'token-ams-amstel-03':  5,
    'token-ams-noord-04':   6,
  }
  const totalParticipants = rows.reduce((s, r) => s + (MEMBERS[r.team_token as string] ?? 5), 0)

  const teamScores: RapportProps['teamScores'] = rows.map((r, i) => ({
    rank:  i + 1,
    name:  r.name as string,
    score: r.total_gms_score as number,
    scorePct: Math.round(((r.total_gms_score as number) / gmsMax) * 100),
    checkpointsDone: subMap[r.id as string] ?? totalCheckpoints,
    dimensions: {
      connection: r.connection as number,
      meaning:    r.meaning    as number,
      joy:        r.joy        as number,
      growth:     r.growth     as number,
    },
  }))

  // 7. Gemiddelde breakdown
  const totalTeams = rows.length
  const avgGmsScore = Math.round(rows.reduce((s, r) => s + (r.total_gms_score as number), 0) / totalTeams)
  const avgGmsPct   = Math.round((avgGmsScore / gmsMax) * 100)

  const gmsBreakdown = {
    connection: Math.round(rows.reduce((s, r) => s + (r.connection as number), 0) / totalTeams),
    meaning:    Math.round(rows.reduce((s, r) => s + (r.meaning    as number), 0) / totalTeams),
    joy:        Math.round(rows.reduce((s, r) => s + (r.joy        as number), 0) / totalTeams),
    growth:     Math.round(rows.reduce((s, r) => s + (r.growth     as number), 0) / totalTeams),
  }
  const gmsBreakdownPct = {
    connection: Math.round((gmsBreakdown.connection / dimensionMaxes.connection) * 100),
    meaning:    Math.round((gmsBreakdown.meaning    / dimensionMaxes.meaning)    * 100),
    joy:        Math.round((gmsBreakdown.joy        / dimensionMaxes.joy)        * 100),
    growth:     Math.round((gmsBreakdown.growth     / dimensionMaxes.growth)     * 100),
  }

  console.log(`✓ Data geladen: ${totalTeams} teams, ${totalParticipants} deelnemers, gem. GMS ${avgGmsScore} (${avgGmsPct}%)`)
  console.log(`  Dimensies: Verbinding ${gmsBreakdown.connection} (${gmsBreakdownPct.connection}%) · Betekenis ${gmsBreakdown.meaning} (${gmsBreakdownPct.meaning}%) · Plezier ${gmsBreakdown.joy} (${gmsBreakdownPct.joy}%) · Groei ${gmsBreakdown.growth} (${gmsBreakdownPct.growth}%)`)

  // 8. Aanbevelingen genereren (op basis van dimensiescores)
  const recommendations = buildRecommendations(gmsBreakdown, dimensionMaxes)
  console.log(`✓ Aanbevelingen: laagste dimensie = ${recommendations[0].label} (${recommendations[0].pct}%)`)

  // 9. AI narratief
  process.stdout.write('  Genereer Impact Narratief via AI... ')
  const narrative = await generateNarrative({
    tourName: 'Amsterdam Impact Wandeling',
    totalTeams, totalParticipants, avgGmsPct,
    topTeam: teamScores[0].name,
    gmsBreakdownPct,
  })
  console.log(`✓ (${narrative.length} tekens)`)

  // 10. Props samenstellen
  const rapportProps: RapportProps = {
    tourName: 'Amsterdam Impact Wandeling',
    variant: session.variant as string,
    sessionDate: session.started_at ? new Date(session.started_at as string) : new Date(session.created_at as string),
    organizationName: (session.organization_name as string | null) ?? 'WeAreImpact B.V.',
    totalTeams,
    totalParticipants,
    avgGmsScore,
    avgGmsPct,
    gmsMax,
    dimensionMaxes,
    gmsBreakdown,
    gmsBreakdownPct,
    teamScores,
    totalCheckpoints,
    narrative,
    recommendations,
  }

  // 11. Render PDF
  console.log('  Render PDF...')
  const React = await import('react')
  // @ts-expect-error — global React nodig voor JSX in standalone script
  globalThis.React = React.default ?? React
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { ImpactRapport } = await import('../src/lib/pdf/impact-rapport')
  const { createElement } = React

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfElement = createElement(ImpactRapport, rapportProps) as any
  const pdfBuffer = await renderToBuffer(pdfElement)

  const outPath = path.join(process.cwd(), 'impactrapport-amsterdam.pdf')
  fs.writeFileSync(outPath, pdfBuffer)

  console.log(`\n✅ PDF opgeslagen: ${outPath}`)
  console.log(`   Grootte: ${Math.round((pdfBuffer as Buffer).length / 1024)} KB · 2 pagina's`)
}

main().catch(e => { console.error(e); process.exit(1) })
