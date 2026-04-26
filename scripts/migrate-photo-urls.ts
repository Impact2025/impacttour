/**
 * Migration: photo_urls kolom voor multi-foto upload
 * Uitvoeren: bun scripts/migrate-photo-urls.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('🚀 Migratie photo_urls gestart...')

  await sql`
    ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS photo_urls jsonb
  `

  console.log('✅ photo_urls kolom toegevoegd aan submissions')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('❌ Migratie mislukt:', err)
  process.exit(1)
})
