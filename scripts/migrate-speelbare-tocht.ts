/**
 * Migratie: Speelbare Tocht self-service flow
 * Run: bun scripts/migrate-speelbare-tocht.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('Migratie: speelbare-tocht schema...')

  // orders: tourId nullable maken + tochtAanvraagId toevoegen
  await sql`ALTER TABLE orders ALTER COLUMN tour_id DROP NOT NULL`
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tocht_aanvraag_id UUID`

  // tocht_aanvragen: self-service kolommen toevoegen
  await sql`ALTER TABLE tocht_aanvragen ADD COLUMN IF NOT EXISTS customer_email TEXT`
  await sql`ALTER TABLE tocht_aanvragen ADD COLUMN IF NOT EXISTS customer_name TEXT`
  await sql`ALTER TABLE tocht_aanvragen ADD COLUMN IF NOT EXISTS order_id UUID`
  await sql`ALTER TABLE tocht_aanvragen ADD COLUMN IF NOT EXISTS tour_id UUID`
  await sql`ALTER TABLE tocht_aanvragen ADD COLUMN IF NOT EXISTS session_id UUID`
  await sql`ALTER TABLE tocht_aanvragen ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'concept'`

  console.log('✓ Migratie succesvol')
}

migrate().catch((err) => {
  console.error('Migratie mislukt:', err)
  process.exit(1)
})
