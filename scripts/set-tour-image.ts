/**
 * Set Tour Image Script
 *
 * Koppel een foto-URL (bijv. Vercel Blob) aan een tour via aiConfig.imageUrl.
 * De TourCard in de marketplace toont deze foto als header ipv de emoji.
 *
 * Gebruik:
 *   bunx tsx scripts/set-tour-image.ts <tour-id-of-naam-deel> <image-url>
 *
 * Voorbeelden:
 *   bunx tsx scripts/set-tour-image.ts "Haarlem Verbindt" "https://xyz.public.blob.vercel-storage.com/haarlem.jpg"
 *   bunx tsx scripts/set-tour-image.ts "amsterdam" "https://xyz.public.blob.vercel-storage.com/amsterdam.jpg"
 *
 * Zoek op: exacte tour-id of case-insensitive naam-match
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  const [search, imageUrl] = process.argv.slice(2)

  if (!search || !imageUrl) {
    console.error('Gebruik: bunx tsx scripts/set-tour-image.ts <naam-of-id> <image-url>')
    process.exit(1)
  }

  // Zoek tour op exacte id of naam (case-insensitive)
  const [tour] = await sql`
    SELECT id, name, ai_config FROM tours
    WHERE id = ${search}
       OR lower(name) LIKE ${'%' + search.toLowerCase() + '%'}
    ORDER BY created_at
    LIMIT 1
  `

  if (!tour) {
    console.error(`❌ Geen tour gevonden voor: "${search}"`)
    process.exit(1)
  }

  const existing = (tour.ai_config as Record<string, unknown>) ?? {}
  const updated = { ...existing, imageUrl }

  await sql`
    UPDATE tours
    SET ai_config = ${JSON.stringify(updated)}::jsonb,
        updated_at = now()
    WHERE id = ${tour.id as string}
  `

  console.log(`✅ Foto ingesteld voor: ${tour.name as string}`)
  console.log(`   ID:  ${tour.id as string}`)
  console.log(`   URL: ${imageUrl}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
