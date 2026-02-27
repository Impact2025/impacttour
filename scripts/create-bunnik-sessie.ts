/**
 * Maakt een game sessie aan voor de JeugdTocht Bunnik
 * Status: lobby (teams kunnen direct joinen)
 * isTestMode: true (GPS-check overgeslagen, handig voor test)
 *
 * Gebruik:
 *   bun scripts/create-bunnik-sessie.ts [spelleider-email]
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// Zelfde logica als generateJoinCode() in src/lib/utils.ts
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

async function run() {
  const spelleiderEmail = process.argv[2] || 'spelleider@impacttocht.nl'

  // Spelleider ophalen
  const [spelleider] = await sql`
    SELECT id FROM users WHERE email = ${spelleiderEmail} LIMIT 1
  `
  if (!spelleider) {
    console.error(`❌ Spelleider '${spelleiderEmail}' niet gevonden.`)
    process.exit(1)
  }

  // Bunnik tour ophalen
  const [tour] = await sql`
    SELECT id FROM tours
    WHERE name LIKE '%Bunnik%' AND variant = 'jeugdtocht'
    ORDER BY created_at DESC
    LIMIT 1
  `
  if (!tour) {
    console.error('❌ JeugdTocht Bunnik niet gevonden. Run eerst: bun scripts/seed-bunnik-jeugd.ts')
    process.exit(1)
  }

  const joinCode = generateJoinCode()

  const [session] = await sql`
    INSERT INTO game_sessions (
      tour_id,
      spelleider_id,
      status,
      join_code,
      variant,
      custom_session_name,
      is_test_mode,
      parental_consent_confirmed,
      parental_consent_at,
      source,
      scheduled_at
    ) VALUES (
      ${tour.id},
      ${spelleider.id},
      'lobby',
      ${joinCode},
      'jeugdtocht',
      'JeugdTocht Bunnik — Duke 13 jaar',
      true,
      true,
      NOW(),
      'direct',
      NOW()
    ) RETURNING id
  `

  console.log(`
✅ Sessie aangemaakt!

   Join code    : ${joinCode}
   Session ID   : ${session.id}
   Status       : lobby (teams kunnen joinen)
   Test mode    : AAN (GPS-check overgeslagen)

   ─────────────────────────────────────────────────────
   Deel deze link met de kids:

   /join?code=${joinCode}

   Of gewoon naar /join → code invoeren: ${joinCode}
   ─────────────────────────────────────────────────────

   Spelleider dashboard:
   /spelleider/sessies/${session.id}

   START de tocht via het dashboard als iedereen gejoind is.
   ─────────────────────────────────────────────────────
`)
}

run().catch(e => { console.error('❌', e); process.exit(1) })
