/**
 * Zet sessie AMST24 naar 'active' met gespreide teamvoortgang
 * voor het maken van app-screenshots (homepage).
 *
 * Uitvoeren: bunx tsx scripts/activate-amsterdam-demo.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  const [session] = await sql`
    UPDATE game_sessions SET status = 'active'
    WHERE join_code = 'AMST24'
    RETURNING id, tour_id
  `
  if (!session) { console.error('Sessie AMST24 niet gevonden'); process.exit(1) }
  console.log(`✓ Sessie AMST24 → active (id: ${session.id})`)

  const cpRows = await sql`
    SELECT id, order_index FROM checkpoints
    WHERE tour_id = ${session.tour_id}
    ORDER BY order_index
  `
  const [cp0, cp1, cp2, cp3, cp4] = cpRows.map(r => r.id as string)

  // Team Jordaan — bij checkpoint 3 (Waterlooplein), CP0+CP1 voltooid
  await sql`
    UPDATE teams SET current_checkpoint_index = 2, completed_checkpoints = ${JSON.stringify([cp0, cp1])}
    WHERE team_token = 'token-ams-jordaan-01'
  `
  console.log('✓ Team Jordaan   → CP3 Waterlooplein  (2 van 5 gedaan)')

  // Team De Pijp — bij checkpoint 4 (Hortus), CP0+CP1+CP2 voltooid
  await sql`
    UPDATE teams SET current_checkpoint_index = 3, completed_checkpoints = ${JSON.stringify([cp0, cp1, cp2])}
    WHERE team_token = 'token-ams-depijp-02'
  `
  console.log('✓ Team De Pijp   → CP4 Hortus         (3 van 5 gedaan)')

  // Team Amstel — bij checkpoint 2 (Nieuwmarkt), CP0 voltooid
  await sql`
    UPDATE teams SET current_checkpoint_index = 1, completed_checkpoints = ${JSON.stringify([cp0])}
    WHERE team_token = 'token-ams-amstel-03'
  `
  console.log('✓ Team Amstel    → CP2 Nieuwmarkt     (1 van 5 gedaan)')

  // Team Noord — bij checkpoint 1 (Begijnhof), net begonnen
  await sql`
    UPDATE teams SET current_checkpoint_index = 0, completed_checkpoints = '[]'
    WHERE team_token = 'token-ams-noord-04'
  `
  console.log('✓ Team Noord     → CP1 Begijnhof      (0 van 5 gedaan)')

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Sessie AMST24 klaar voor screenshots!

sessionStorage.setItem('teamToken', 'token-ams-jordaan-01')
→ /game/${session.id}

Schermen:
  Hoofd (kaart+missie): /game/${session.id}
  Kaart:                /game/${session.id}/kaart
  Prestaties:           /game/${session.id}/prestaties
  Voltooid + podium:    /game/${session.id}/voltooid
  Rapport:              /game/${session.id}/rapport
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main().catch(e => { console.error(e); process.exit(1) })
