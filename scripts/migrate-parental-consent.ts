/**
 * Migration: parental_consent kolommen voor AVG/GDPR compliance
 * Van toepassing op JeugdTocht en VoetbalMissie sessies.
 *
 * Uitvoeren: bun scripts/migrate-parental-consent.ts
 *
 * Voegt toe aan game_sessions:
 * - parental_consent_confirmed (bool): spelleider heeft toestemming bevestigd
 * - parental_consent_at (timestamp): tijdstip van bevestiging
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('🚀 Parental consent migratie gestart...')

  await sql`
    ALTER TABLE game_sessions
      ADD COLUMN IF NOT EXISTS parental_consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS parental_consent_at TIMESTAMP
  `
  console.log('✅ parental_consent_confirmed + parental_consent_at toegevoegd aan game_sessions')

  // Index voor snel opvragen van sessies zonder toestemming (voor audit/admin)
  await sql`
    CREATE INDEX IF NOT EXISTS idx_game_sessions_parental_consent
      ON game_sessions (variant, parental_consent_confirmed)
      WHERE variant IN ('jeugdtocht', 'voetbalmissie')
  `
  console.log('✅ Index op parental_consent voor kids-varianten aangemaakt')

  console.log('')
  console.log('📋 Volgende stap: voeg toestemmingscheckbox toe in klant/[sessionId]/setup')
  console.log('   voor JeugdTocht en VoetbalMissie sessies.')
  console.log('   Zie: src/app/(klant)/klant/[sessionId]/setup voor de UI.')
  console.log('')
  console.log('✅ Migratie voltooid.')
}

migrate().catch((err) => {
  console.error('❌ Migratie mislukt:', err)
  process.exit(1)
})
