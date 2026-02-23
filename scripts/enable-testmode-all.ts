/**
 * Zet test mode aan voor alle actieve/lobby sessies
 * Uitvoeren: bun scripts/enable-testmode-all.ts
 */
import { sql } from 'drizzle-orm'
import { db } from '../src/lib/db'

async function run() {
  console.log('Test mode inschakelen voor alle actieve sessies...')

  const result = await db.execute(sql`
    UPDATE game_sessions
    SET is_test_mode = true
    WHERE status IN ('lobby', 'active', 'paused')
    RETURNING id, status, join_code
  `)

  console.log(`✅ ${result.rows.length} sessie(s) bijgewerkt:`)
  for (const row of result.rows) {
    console.log(`  - ${row.id} (${row.status}) joinCode: ${row.join_code}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Mislukt:', err)
  process.exit(1)
})
