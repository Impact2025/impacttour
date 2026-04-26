import { sql } from 'drizzle-orm'
import { db } from '../src/lib/db'

async function main() {
  console.log('Adding navigation_hint column to checkpoints...')
  await db.execute(sql`
    ALTER TABLE checkpoints
    ADD COLUMN IF NOT EXISTS navigation_hint text
  `)
  console.log('Done! Column navigation_hint added.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
