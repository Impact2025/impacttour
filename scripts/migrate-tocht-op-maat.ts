/**
 * Migration: tocht_aanvragen tabel
 * Uitvoeren: bun scripts/migrate-tocht-op-maat.ts
 *
 * Voegt de tabel toe voor Tocht op Maat aanvragen (wizard leads).
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('Tocht op Maat migratie gestart...')

  await sql`
    CREATE TABLE IF NOT EXISTS tocht_aanvragen (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      groep_type TEXT NOT NULL,
      sfeer TEXT NOT NULL,
      stad TEXT NOT NULL,
      deelnemers INTEGER NOT NULL,
      duur_minuten INTEGER NOT NULL,
      extra_wensen TEXT,
      gegenereerde_json JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('tocht_aanvragen tabel aangemaakt')

  console.log('Migratie voltooid.')
}

migrate().catch((err) => {
  console.error('Migratie mislukt:', err)
  process.exit(1)
})
