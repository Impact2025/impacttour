/**
 * Migratie: VoetbalMissie kolommen + enum waarde
 *
 * Voert de volgende wijzigingen uit op de bestaande database:
 * 1. Voegt 'voetbalmissie' toe aan de tour_variant enum
 * 2. Voegt story_frame, pricing_model, price_per_person_cents toe aan tours
 * 3. Voegt time_limit_seconds, bonus_photo_points toe aan checkpoints
 *
 * Gebruik: bun scripts/migrate-voetbalmissie.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function run(label: string, query: string) {
  process.stdout.write(`  ${label}... `)
  try {
    await sql.query(query)
    console.log('✓')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (
      msg.includes('already exists') ||
      msg.includes('duplicate column') ||
      msg.includes('already a member')
    ) {
      console.log('(al aanwezig, skip)')
    } else {
      console.log('✗ ' + msg)
      throw e
    }
  }
}

async function migrate() {
  console.log('\n⚽ Migratie: VoetbalMissie kolommen\n')

  // 1. Voeg 'voetbalmissie' toe aan de tour_variant enum
  // PostgreSQL staat ALTER TYPE ... ADD VALUE toe zonder transactie
  await run(
    "tour_variant: +voetbalmissie",
    `ALTER TYPE tour_variant ADD VALUE IF NOT EXISTS 'voetbalmissie'`
  )

  // 2. Nieuwe kolommen op de tours-tabel
  await run(
    "tours: +story_frame",
    `ALTER TABLE tours ADD COLUMN IF NOT EXISTS story_frame jsonb`
  )
  await run(
    "tours: +pricing_model",
    `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_model text NOT NULL DEFAULT 'flat'`
  )
  await run(
    "tours: +price_per_person_cents",
    `ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_per_person_cents integer NOT NULL DEFAULT 0`
  )

  // 3. Nieuwe kolommen op de checkpoints-tabel
  await run(
    "checkpoints: +time_limit_seconds",
    `ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS time_limit_seconds integer`
  )
  await run(
    "checkpoints: +bonus_photo_points",
    `ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS bonus_photo_points integer NOT NULL DEFAULT 0`
  )

  console.log('\n✅ Migratie succesvol afgerond!\n')
  console.log('Volgende stap:')
  console.log('  bun scripts/seed-voetbalmissie.ts [spelleider-email]\n')
}

migrate().catch((e) => {
  console.error('❌ Migratie fout:', e)
  process.exit(1)
})
