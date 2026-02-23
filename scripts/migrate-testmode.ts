/**
 * Migratie: voeg is_test_mode kolom toe aan game_sessions
 * Uitvoeren: bun scripts/migrate-testmode.ts
 */
import { sql } from 'drizzle-orm'
import { db } from '../src/lib/db'

async function migrate() {
  console.log('Migratie: is_test_mode kolom toevoegen...')

  await db.execute(sql`
    ALTER TABLE game_sessions
    ADD COLUMN IF NOT EXISTS is_test_mode boolean DEFAULT false NOT NULL
  `)

  console.log('✅ Klaar!')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('❌ Migratie mislukt:', err)
  process.exit(1)
})
