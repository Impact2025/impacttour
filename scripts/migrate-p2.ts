/**
 * Migration P2: session_scores tabel
 * Uitvoeren: bun scripts/migrate-p2.ts
 *
 * Gedenormaliseerde GMS-scores per team per sessie.
 * Elimineert live aggregatie van alle submissions bij rapport-opvraag.
 * Backward-compatible: rapport route heeft fallback naar submissions als row ontbreekt.
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('🚀 P2 migratie gestart...')

  // 1. Session scores tabel
  await sql`
    CREATE TABLE IF NOT EXISTS session_scores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      connection INTEGER NOT NULL DEFAULT 0,
      meaning INTEGER NOT NULL DEFAULT 0,
      joy INTEGER NOT NULL DEFAULT 0,
      growth INTEGER NOT NULL DEFAULT 0,
      total_gms INTEGER NOT NULL DEFAULT 0,
      checkpoints_count INTEGER NOT NULL DEFAULT 0,
      checkpoint_scores JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(session_id, team_id)
    )
  `
  console.log('✅ session_scores tabel aangemaakt')

  // 2. Index voor snelle team-lookup per sessie
  await sql`
    CREATE INDEX IF NOT EXISTS session_scores_session_team_idx
    ON session_scores(session_id, team_id)
  `
  console.log('✅ Index session_scores_session_team_idx aangemaakt')

  // 3. Backfill: bereken scores uit bestaande submissions voor actieve sessies
  //    Zodat bestaande sessies ook profiteren van de fast path.
  console.log('⏳ Backfill bestaande submissions...')
  await sql`
    INSERT INTO session_scores (session_id, team_id, connection, meaning, joy, growth, total_gms, checkpoints_count, checkpoint_scores)
    SELECT
      t.game_session_id AS session_id,
      t.id AS team_id,
      COALESCE(SUM((s.ai_evaluation->>'connection')::int), 0) AS connection,
      COALESCE(SUM((s.ai_evaluation->>'meaning')::int), 0) AS meaning,
      COALESCE(SUM((s.ai_evaluation->>'joy')::int), 0) AS joy,
      COALESCE(SUM((s.ai_evaluation->>'growth')::int), 0) AS growth,
      COALESCE(SUM(s.gms_earned), 0) AS total_gms,
      COUNT(s.id) AS checkpoints_count,
      '[]'::jsonb AS checkpoint_scores
    FROM teams t
    LEFT JOIN submissions s ON s.team_id = t.id
    GROUP BY t.game_session_id, t.id
    ON CONFLICT (session_id, team_id) DO NOTHING
  `
  console.log('✅ Backfill voltooid (checkpoint_scores JSON wordt live opgebouwd)')

  console.log('\n🎉 P2 migratie succesvol afgerond!')
  console.log('   → Nieuwe submissions schrijven naar session_scores (incrementeel)')
  console.log('   → Rapport route gebruikt fast path via session_scores')
  console.log('   → OPENROUTER_FAST_MODEL env var instellen voor Haiku model (optioneel)')
}

migrate().catch((err) => {
  console.error('❌ Migratie mislukt:', err)
  process.exit(1)
})
