import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL!)

async function main() {
  const rows = await sql`SELECT id, name, variant, is_published, price_in_cents FROM tours ORDER BY name, created_at`
  for (const r of rows) {
    const pub = r.is_published ? 'PUB' : 'UNP'
    const price = `€${Math.round(r.price_in_cents / 100)}`
    console.log(`[${pub}] ${String(r.variant).padEnd(15)} ${price.padStart(6)}  ${r.name}  (${String(r.id).slice(0, 8)})`)
  }
}
main().catch(console.error)
