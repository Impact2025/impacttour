/**
 * Migration: Marketplace tabellen + kolomuitbreidingen
 * Uitvoeren: bun scripts/migrate-marketplace.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('🚀 Marketplace migratie gestart...')

  // 1. Uitbreid users tabel
  await sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS organization_name TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT
  `
  console.log('✅ users: organization_name + phone toegevoegd')

  // 2. Uitbreid game_sessions tabel
  await sql`
    ALTER TABLE game_sessions
      ADD COLUMN IF NOT EXISTS custom_session_name TEXT,
      ADD COLUMN IF NOT EXISTS welcome_message TEXT,
      ADD COLUMN IF NOT EXISTS organization_name TEXT,
      ADD COLUMN IF NOT EXISTS msp_order_id TEXT,
      ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'direct'
  `
  console.log('✅ game_sessions: marketplace kolommen toegevoegd')

  // 3. Coupons tabel
  await sql`
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      discount_type TEXT NOT NULL DEFAULT 'percent',
      discount_value INTEGER NOT NULL DEFAULT 0,
      max_uses INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMP,
      tour_id UUID REFERENCES tours(id),
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `
  console.log('✅ coupons tabel aangemaakt')

  // 4. Orders tabel
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      session_id UUID REFERENCES game_sessions(id),
      tour_id UUID NOT NULL REFERENCES tours(id),
      coupon_code TEXT REFERENCES coupons(code),
      amount_cents INTEGER NOT NULL DEFAULT 0,
      original_amount_cents INTEGER NOT NULL DEFAULT 0,
      participant_count INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      msp_order_id TEXT,
      paid_at TIMESTAMP,
      organization_name TEXT,
      customer_name TEXT,
      customer_email TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `
  console.log('✅ orders tabel aangemaakt')

  // 5. Index op orders (elk apart — Neon ondersteunt geen multi-statement)
  await sql`CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS orders_session_idx ON orders(session_id)`
  await sql`CREATE INDEX IF NOT EXISTS orders_msp_idx ON orders(msp_order_id)`
  console.log('✅ Indexen aangemaakt')

  // 6. Demo coupon voor testen
  await sql`
    INSERT INTO coupons (code, discount_type, discount_value, description)
    VALUES ('GRATIS2024', 'free', 100, 'Demo gratis coupon voor testen')
    ON CONFLICT (code) DO NOTHING
  `
  console.log('✅ Demo coupon GRATIS2024 aangemaakt')

  console.log('\n🎉 Migratie succesvol afgerond!')
}

migrate().catch((err) => {
  console.error('❌ Migratie mislukt:', err)
  process.exit(1)
})
