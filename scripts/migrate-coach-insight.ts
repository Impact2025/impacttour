/**
 * Migration: voeg coach_insight kolom toe aan session_scores
 * Uitvoeren: bun scripts/migrate-coach-insight.ts
 *
 * Cachet de AI-gegenereerde coach insight per team per sessie.
 * Rapport API genereert de insight eenmalig en slaat deze op — volgende
 * views lezen direct uit de DB zonder extra AI-call.
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('🚀 Coach insight migratie gestart...')

  await sql`
    ALTER TABLE session_scores
    ADD COLUMN IF NOT EXISTS coach_insight TEXT
  `
  console.log('✅ session_scores.coach_insight kolom toegevoegd')

  console.log('🎉 Migratie voltooid!')
}

migrate().catch((err) => {
  console.error('❌ Migratie mislukt:', err)
  process.exit(1)
})
