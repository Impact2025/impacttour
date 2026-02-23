/**
 * Migration P1: webhook_events tabel
 * Uitvoeren: bun scripts/migrate-p1.ts
 *
 * Voegt webhook audit log toe voor MultiSafepay (en toekomstige providers).
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('🚀 P1 migratie gestart...')

  // 1. Webhook events audit tabel
  await sql`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider TEXT NOT NULL,
      event_id TEXT NOT NULL,
      raw_payload JSONB,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      processed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `
  console.log('✅ webhook_events tabel aangemaakt')

  // 2. Index voor snelle deduplicatie-lookup (provider + event_id)
  await sql`
    CREATE INDEX IF NOT EXISTS webhook_event_provider_event_idx
    ON webhook_events(provider, event_id)
  `
  console.log('✅ Index webhook_event_provider_event_idx aangemaakt')

  // 3. Index voor status-filtering (bijv. dashboard toont failed events)
  await sql`
    CREATE INDEX IF NOT EXISTS webhook_event_status_idx
    ON webhook_events(status)
    WHERE status IN ('pending', 'failed')
  `
  console.log('✅ Partial index op status aangemaakt')

  console.log('\n🎉 P1 migratie succesvol afgerond!')
  console.log('   → webhook_events beschikbaar voor MSP audit log')
}

migrate().catch((err) => {
  console.error('❌ Migratie mislukt:', err)
  process.exit(1)
})
