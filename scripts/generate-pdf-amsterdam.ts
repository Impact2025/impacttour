/**
 * Genereer PDF impactrapport voor Amsterdam demo sessie AMST24.
 * Slaat op als: impactrapport-amsterdam.pdf
 *
 * Uitvoeren: bunx tsx scripts/generate-pdf-amsterdam.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const MODEL = process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-sonnet-4-6'

async function generateNarrative(params: {
  tourName: string
  totalTeams: number
  avgGmsScore: number
  topTeam: string
  gmsBreakdown: { connection: number; meaning: number; joy: number; growth: number }
}): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://impacttocht.nl',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `Je schrijft het Impact Narratief voor een IctusGo teambuilding rapport.
Schrijf 3 alinea's (300-400 woorden) in het Nederlands over de gezamenlijke prestatie van alle teams.
Geen kopteksten, geen bullet points. Warm, inspirerend, zakelijk. Eindig met een uitnodiging voor een volgende tocht.`,
        },
        {
          role: 'user',
          content: `Tocht: ${params.tourName} door Amsterdam
${params.totalTeams} teams namen deel, gemiddelde GMS score: ${params.avgGmsScore} punten (max 385).
Winnend team: ${params.topTeam}
GMS-dimensies gemiddeld: Verbinding ${params.gmsBreakdown.connection}pt · Betekenis ${params.gmsBreakdown.meaning}pt · Plezier ${params.gmsBreakdown.joy}pt · Groei ${params.gmsBreakdown.growth}pt
Route: Begijnhof → Nieuwmarkt → Waterlooplein → Hortus Botanicus → Oosterpark`,
        },
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content.trim()
}

async function main() {
  console.log('\n📄 Genereer PDF voor Amsterdam demo sessie AMST24...\n')

  // 1. Zet sessie op completed (nodig voor PDF)
  const [session] = await sql`
    UPDATE game_sessions SET status = 'completed'
    WHERE join_code = 'AMST24'
    RETURNING id, tour_id, created_at, started_at, variant
  `
  if (!session) throw new Error('Sessie AMST24 niet gevonden')
  console.log('✓ Sessie status → completed')

  // 2. Haal teams op (gesorteerd op score)
  const teams = await sql`
    SELECT name, total_gms_score, completed_checkpoints
    FROM teams
    WHERE game_session_id = ${session.id as string}
    ORDER BY total_gms_score DESC
  `

  // 3. Haal checkpoints op
  const checkpoints = await sql`
    SELECT gms_connection, gms_meaning, gms_joy, gms_growth
    FROM checkpoints
    WHERE tour_id = ${session.tour_id as string}
  `

  const totalTeams = teams.length
  const avgGmsScore = Math.round(
    teams.reduce((s: number, t) => s + (t.total_gms_score as number), 0) / totalTeams
  )
  const topTeam = teams[0].name as string

  // GMS breakdown als gemiddelde per dimensie (proportioneel)
  const totalConn   = checkpoints.reduce((s, c) => s + (c.gms_connection as number), 0)
  const totalMean   = checkpoints.reduce((s, c) => s + (c.gms_meaning   as number), 0)
  const totalJoy    = checkpoints.reduce((s, c) => s + (c.gms_joy       as number), 0)
  const totalGrowth = checkpoints.reduce((s, c) => s + (c.gms_growth    as number), 0)
  const grandTotal  = totalConn + totalMean + totalJoy + totalGrowth || 1

  const gmsBreakdown = {
    connection: Math.round((totalConn   / grandTotal) * avgGmsScore),
    meaning:    Math.round((totalMean   / grandTotal) * avgGmsScore),
    joy:        Math.round((totalJoy    / grandTotal) * avgGmsScore),
    growth:     Math.round((totalGrowth / grandTotal) * avgGmsScore),
  }

  console.log(`✓ Data geladen: ${totalTeams} teams, gem. GMS ${avgGmsScore}, winnaar: ${topTeam}`)

  // 4. Genereer narratief via AI
  process.stdout.write('  Genereer Impact Narratief via AI... ')
  const narrative = await generateNarrative({
    tourName: 'Amsterdam Impact Wandeling',
    totalTeams,
    avgGmsScore,
    topTeam,
    gmsBreakdown,
  })
  console.log(`✓ (${narrative.length} tekens)`)

  // 5. Render PDF
  console.log('  Render PDF...')
  const React = await import('react')
  // @ts-expect-error — global React nodig voor JSX in standalone script (geen Next.js transform)
  globalThis.React = React.default ?? React
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { ImpactRapport } = await import('../src/lib/pdf/impact-rapport')
  const { createElement } = React

  const rapportProps = {
    tourName: 'Amsterdam Impact Wandeling',
    variant: session.variant as string,
    sessionDate: session.started_at ? new Date(session.started_at as string) : new Date(session.created_at as string),
    totalTeams,
    avgGmsScore,
    gmsBreakdown,
    topTeams: teams.slice(0, 10).map((t, idx) => ({
      rank: idx + 1,
      name: t.name as string,
      score: t.total_gms_score as number,
      checkpointsDone: Array.isArray(t.completed_checkpoints)
        ? (t.completed_checkpoints as string[]).length
        : 5,
    })),
    totalCheckpoints: checkpoints.length,
    narrative,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfElement = createElement(ImpactRapport, rapportProps) as any
  const pdfBuffer = await renderToBuffer(pdfElement)

  // 6. Sla op
  const outPath = path.join(process.cwd(), 'impactrapport-amsterdam.pdf')
  fs.writeFileSync(outPath, pdfBuffer)

  console.log(`\n✅ PDF opgeslagen: ${outPath}`)
  console.log(`   Grootte: ${Math.round((pdfBuffer as Buffer).length / 1024)} KB`)
  console.log(`\n📊 Samenvatting rapport:`)
  console.log(`   Tocht:        Amsterdam Impact Wandeling`)
  console.log(`   Teams:        ${totalTeams} (22 deelnemers)`)
  console.log(`   Gem. GMS:     ${avgGmsScore}`)
  console.log(`   Winnaar:      ${topTeam}`)
  console.log(`   Dimensies:    Verbinding ${gmsBreakdown.connection} · Betekenis ${gmsBreakdown.meaning} · Plezier ${gmsBreakdown.joy} · Groei ${gmsBreakdown.growth}`)
}

main().catch(e => { console.error(e); process.exit(1) })
