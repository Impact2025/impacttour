/**
 * Verwijder een tocht op naam (inclusief actieve sessies)
 * Uitvoeren: bun scripts/delete-tour.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const TOUR_NAMES = [
  'Haarlemmermeer Circulaire Tocht',
]

async function deleteTour(name: string) {
  const tours = await sql`SELECT id, name FROM tours WHERE name = ${name}`
  if (tours.length === 0) {
    console.log(`❌ Tour niet gevonden: ${name}`)
    return
  }
  const tour = tours[0]
  console.log(`✅ Tour gevonden: ${tour.id} — ${tour.name}`)

  const sessions = await sql`SELECT id, status FROM game_sessions WHERE tour_id = ${tour.id}`
  console.log(`   📋 Sessies: ${sessions.length}`)

  const sessionIds = sessions.map((s: { id: string }) => s.id)
  if (sessionIds.length > 0) {
    const ordersDeleted = await sql`DELETE FROM orders WHERE session_id = ANY(${sessionIds}) RETURNING id`
    if (ordersDeleted.length > 0) console.log(`   🗑️  ${ordersDeleted.length} order(s) verwijderd`)
  }

  const deleted = await sql`DELETE FROM game_sessions WHERE tour_id = ${tour.id} RETURNING id`
  if (deleted.length > 0) console.log(`   🗑️  ${deleted.length} sessie(s) verwijderd (cascade)`)

  await sql`DELETE FROM tours WHERE id = ${tour.id}`
  console.log(`   🗑️  Tour verwijderd: ${tour.name}`)
}

async function run() {
  for (const name of TOUR_NAMES) {
    await deleteTour(name)
  }
}

run().catch(console.error)
