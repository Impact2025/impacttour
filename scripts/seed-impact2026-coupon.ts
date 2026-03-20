/**
 * Seed: Impact2026 gratis couponcode
 * Run: bun scripts/seed-impact2026-coupon.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('Seeden Impact2026 coupon...')

  await sql`
    INSERT INTO coupons (code, discount_type, discount_value, max_uses, used_count, expires_at, tour_id, description)
    VALUES (
      'IMPACT2026',
      'free',
      0,
      NULL,
      0,
      NULL,
      NULL,
      'Interne gratis code — volledige korting op speelbare tocht (zelfservice)'
    )
    ON CONFLICT (code) DO UPDATE
      SET discount_type   = EXCLUDED.discount_type,
          discount_value  = EXCLUDED.discount_value,
          max_uses        = EXCLUDED.max_uses,
          expires_at      = EXCLUDED.expires_at,
          description     = EXCLUDED.description
  `

  console.log('✓ Impact2026 coupon aangemaakt (of bijgewerkt)')
}

seed().catch((err) => {
  console.error('Seed mislukt:', err)
  process.exit(1)
})
