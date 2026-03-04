/**
 * Genereer echte AI Coach Insights voor de Amsterdam demo sessie
 * via OpenRouter (claude-sonnet-4-6) en sla op in session_scores.
 *
 * Uitvoeren: bunx tsx scripts/generate-coach-insights-amsterdam.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const MODEL = process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-sonnet-4-6'

// ─── Checkpoint maxima (uit seed-amsterdam-demo.ts) ──────────────────────────
const DIMENSION_MAXES = { connection: 100, meaning: 105, joy: 100, growth: 80 }
const GMS_MAX = 385

const CHECKPOINT_SCORES: Record<string, { name: string; gmsEarned: number; orderIndex: number }[]> = {
  'token-ams-jordaan-01': [
    { name: 'Begijnhof — Verborgen Oase',       gmsEarned: 75, orderIndex: 0 },
    { name: 'Nieuwmarkt — Bruisend Plein',        gmsEarned: 68, orderIndex: 1 },
    { name: 'Waterlooplein — Markt van Verhalen', gmsEarned: 68, orderIndex: 2 },
    { name: 'Hortus Botanicus — Groene Stilte',   gmsEarned: 73, orderIndex: 3 },
    { name: 'Oosterpark — Impact Gevierd!',        gmsEarned: 68, orderIndex: 4 },
  ],
  'token-ams-depijp-02': [
    { name: 'Begijnhof — Verborgen Oase',         gmsEarned: 65, orderIndex: 0 },
    { name: 'Nieuwmarkt — Bruisend Plein',          gmsEarned: 59, orderIndex: 1 },
    { name: 'Waterlooplein — Markt van Verhalen',   gmsEarned: 60, orderIndex: 2 },
    { name: 'Hortus Botanicus — Groene Stilte',     gmsEarned: 64, orderIndex: 3 },
    { name: 'Oosterpark — Impact Gevierd!',          gmsEarned: 59, orderIndex: 4 },
  ],
  'token-ams-amstel-03': [
    { name: 'Begijnhof — Verborgen Oase',           gmsEarned: 55, orderIndex: 0 },
    { name: 'Nieuwmarkt — Bruisend Plein',            gmsEarned: 49, orderIndex: 1 },
    { name: 'Waterlooplein — Markt van Verhalen',     gmsEarned: 50, orderIndex: 2 },
    { name: 'Hortus Botanicus — Groene Stilte',       gmsEarned: 53, orderIndex: 3 },
    { name: 'Oosterpark — Impact Gevierd!',            gmsEarned: 50, orderIndex: 4 },
  ],
  'token-ams-noord-04': [
    { name: 'Begijnhof — Verborgen Oase',             gmsEarned: 45, orderIndex: 0 },
    { name: 'Nieuwmarkt — Bruisend Plein',              gmsEarned: 38, orderIndex: 1 },
    { name: 'Waterlooplein — Markt van Verhalen',       gmsEarned: 40, orderIndex: 2 },
    { name: 'Hortus Botanicus — Groene Stilte',         gmsEarned: 42, orderIndex: 3 },
    { name: 'Oosterpark — Impact Gevierd!',              gmsEarned: 40, orderIndex: 4 },
  ],
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://impacttocht.nl',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content.trim()
}

function buildPrompts(params: {
  teamName: string
  totalScore: number
  members: number
  dimensions: { connection: number; meaning: number; joy: number; growth: number }
  checkpointScores: { name: string; gmsEarned: number; orderIndex: number }[]
}) {
  const { teamName, totalScore, members, dimensions, checkpointScores } = params

  const withPct = [
    { name: 'verbinding', pct: Math.round((dimensions.connection / DIMENSION_MAXES.connection) * 100) },
    { name: 'betekenis',  pct: Math.round((dimensions.meaning    / DIMENSION_MAXES.meaning)    * 100) },
    { name: 'plezier',    pct: Math.round((dimensions.joy        / DIMENSION_MAXES.joy)        * 100) },
    { name: 'groei',      pct: Math.round((dimensions.growth     / DIMENSION_MAXES.growth)     * 100) },
  ].sort((a, b) => b.pct - a.pct)

  const strongest = withPct[0]
  const weakest   = withPct[withPct.length - 1]
  const scorePct  = Math.round((totalScore / GMS_MAX) * 100)

  const sorted = [...checkpointScores].sort((a, b) => a.orderIndex - b.orderIndex)
  const first  = sorted[0].gmsEarned
  const last   = sorted[sorted.length - 1].gmsEarned
  const trend  = last > first * 1.1 ? 'stijgend' : last < first * 0.9 ? 'dalend' : 'stabiel'
  const bestCp  = sorted.reduce((a, b) => a.gmsEarned >= b.gmsEarned ? a : b)
  const worstCp = sorted.reduce((a, b) => a.gmsEarned <= b.gmsEarned ? a : b)

  const system = `Je bent een empathische, scherpe teamcoach voor IctusGo GPS teambuilding.
Schrijf een persoonlijk Coach Inzicht in 4 alinea's (totaal 400-500 woorden) in het Nederlands.

Structuur:
1. Opening — persoonlijk, team-specifiek, 2 warme zinnen die de totaalervaring in Amsterdam vatten.
2. Sterkste moment — noem het beste checkpoint bij naam (${bestCp.name}), leg uit waarom die dimensie (${strongest.name} · ${strongest.pct}%) zo sterk was voor dit team.
3. Groeirichting — de laagste dimensie (${weakest.name} · ${weakest.pct}%) concreet bespreken: wat hield het team terug en hoe kunnen ze dit praktisch verbeteren?
4. Uitdaging + afsluiting — één specifieke uitdaging voor een volgende tocht, eindig energiek en uitnodigend.

Regels:
- Gebruik altijd de teamnaam.
- Geen bulletpoints, geen kopteksten, geen markdown.
- Scoreontwikkeling was ${trend} — reflecteer dit subtiel.
- Schrijf in de tweede persoon (jullie / jij).
- De tocht ging door Amsterdam: Begijnhof, Nieuwmarkt, Waterlooplein, Hortus Botanicus, Oosterpark.`

  const user = `Team: ${teamName}
Tocht: Amsterdam Impact Wandeling (wijktocht)
Score: ${scorePct}% (${totalScore}/${GMS_MAX} punten)
Teamgrootte: ${members} personen
Checkpoints voltooid: 5/5
Scoreontwikkeling: ${trend}
Beste checkpoint: ${bestCp.name} (${bestCp.gmsEarned} pt)
Lastigste checkpoint: ${worstCp.name} (${worstCp.gmsEarned} pt)

Dimensiescores (% van max):
${withPct.map(d => `- ${d.name}: ${d.pct}%`).join('\n')}`

  return { system, user }
}

async function main() {
  console.log(`\n🤖 Genereer AI Coach Insights voor Amsterdam demo (model: ${MODEL})\n`)

  // Haal teams + session_scores op
  const rows = await sql`
    SELECT
      t.id        AS team_id,
      t.name      AS team_name,
      t.team_token,
      t.total_gms_score,
      ss.id       AS score_id,
      ss.connection,
      ss.meaning,
      ss.joy,
      ss.growth
    FROM teams t
    JOIN session_scores ss ON ss.team_id = t.id
    JOIN game_sessions gs  ON gs.id = ss.session_id
    WHERE gs.join_code = 'AMST24'
    ORDER BY t.total_gms_score DESC
  `

  const MEMBERS: Record<string, number> = {
    'token-ams-jordaan-01': 6,
    'token-ams-depijp-02':  5,
    'token-ams-amstel-03':  5,
    'token-ams-noord-04':   6,
  }

  for (const row of rows) {
    const token = row.team_token as string
    const checkpointScores = CHECKPOINT_SCORES[token]
    if (!checkpointScores) { console.log(`⚠ Geen checkpointdata voor ${row.team_name}`); continue }

    const { system, user } = buildPrompts({
      teamName: row.team_name as string,
      totalScore: row.total_gms_score as number,
      members: MEMBERS[token] ?? 5,
      dimensions: {
        connection: row.connection as number,
        meaning:    row.meaning as number,
        joy:        row.joy as number,
        growth:     row.growth as number,
      },
      checkpointScores,
    })

    process.stdout.write(`  Genereer voor ${row.team_name}... `)
    const insight = await callAI(system, user)

    await sql`
      UPDATE session_scores
      SET coach_insight = ${insight}, updated_at = now()
      WHERE id = ${row.score_id as string}
    `
    console.log(`✓ (${insight.length} tekens)`)
    console.log(`\n--- ${row.team_name} ---\n${insight}\n`)
  }

  console.log('✅ Alle Coach Insights bijgewerkt in session_scores!')
}

main().catch(e => { console.error(e); process.exit(1) })
