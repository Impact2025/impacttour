/**
 * Migratie: voeg stripe_session_id kolom toe aan de orders tabel.
 * Run: bun scripts/migrate-stripe-marketplace.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  console.log('Migreren: stripe_session_id kolom toevoegen aan orders...')

  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS stripe_session_id text
  `

  console.log('✓ Klaar.')
}

run().catch((err) => {
  console.error('Migratie mislukt:', err)
  process.exit(1)
})
