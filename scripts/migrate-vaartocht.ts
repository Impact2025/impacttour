/**
 * Migratie: VaarTocht enum waarde
 *
 * Voegt 'vaartocht' toe aan de tour_variant enum.
 * Er zijn geen nieuwe kolommen nodig — de per-checkpoint unlock_radius_meters
 * dekt de grotere GPS-zones op het water al.
 *
 * Gebruik: bun scripts/migrate-vaartocht.ts
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
    if (msg.includes('already exists') || msg.includes('already a member')) {
      console.log('(al aanwezig, skip)')
    } else {
      console.log('✗ ' + msg)
      throw e
    }
  }
}

async function migrate() {
  console.log('\n⛵ Migratie: VaarTocht enum waarde\n')

  await run(
    'tour_variant: +vaartocht',
    `ALTER TYPE tour_variant ADD VALUE IF NOT EXISTS 'vaartocht'`
  )

  console.log('\n✅ Migratie succesvol afgerond!\n')
  console.log('Volgende stap:')
  console.log('  bun scripts/seed-vaartocht.ts [spelleider-email]\n')
}

migrate().catch((e) => {
  console.error('❌ Migratie fout:', e)
  process.exit(1)
})
