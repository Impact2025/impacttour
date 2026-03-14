/**
 * Update Pricing Script
 *
 * Werkt alle bestaande tours bij met:
 * 1. Markttarieven (per variant)
 * 2. aiConfig met locatie, tagline en emoji
 *
 * Uitvoeren:
 *   bunx tsx scripts/update-pricing.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// ─── Prijzen per variant ───────────────────────────────────────────────────────
// Marktonderzoek: concurrenten €25-€42 p.p., ImpactTour premium door GMS-rapport

const PRICING: Record<string, { model: string; ppCents: number; flatCents: number }> = {
  wijktocht:     { model: 'per_person', ppCents: 3900, flatCents: 0 },
  impactsprint:  { model: 'per_person', ppCents: 2900, flatCents: 0 },
  familietocht:  { model: 'per_person', ppCents: 2200, flatCents: 0 },
  jeugdtocht:    { model: 'per_person', ppCents: 750,  flatCents: 0 },
  voetbalmissie: { model: 'per_person', ppCents: 600,  flatCents: 0 },
}

// ─── Locatie mapping op naam ───────────────────────────────────────────────────

function getLocationMeta(name: string, variant: string): {
  location: string; region: string; tagline: string; emoji: string
} {
  const n = name.toLowerCase()

  if (n.includes('amsterdam')) return {
    location: 'Amsterdam',
    region: 'Noord-Holland',
    tagline: 'Ontdek de sociale ziel van Amsterdam',
    emoji: '🏙️',
  }
  if (n.includes('bunnik')) return {
    location: 'Bunnik',
    region: 'Utrecht',
    tagline: 'Buurtavontuur door het groene dorp',
    emoji: '🏡',
  }
  if (n.includes('reeuwijk') || n.includes('gouda') || n.includes('las terrenas')) return {
    location: n.includes('las terrenas') ? 'Las Terrenas (DR)' : 'Reeuwijk',
    region: n.includes('las terrenas') ? 'Dominicaanse Republiek' : 'Zuid-Holland',
    tagline: 'Natuur, water en gemeenschap',
    emoji: '💧',
  }
  if (n.includes('heemstede')) return {
    location: 'Heemstede',
    region: 'Noord-Holland',
    tagline: 'Rust, natuur en hechte gemeenschap in Heemstede',
    emoji: '🌳',
  }
  if (variant === 'voetbalmissie') return {
    location: 'Haarlemmermeer',
    region: 'Noord-Holland',
    tagline: 'Voetbal als kracht voor verbinding en teamwork',
    emoji: '⚽',
  }
  if (n.includes('haarlemmermeer') || n.includes('circulair')) return {
    location: 'Haarlemmermeer',
    region: 'Noord-Holland',
    tagline: 'Duurzaamheid en verbinding in de polder',
    emoji: '🌻',
  }
  if (n.includes('vennep') || n.includes('nieuw-vennep')) return {
    location: 'Haarlemmermeer',
    region: 'Noord-Holland',
    tagline: 'Verbinding en gemeenschapskracht in de polder',
    emoji: '🌾',
  }
  if (n.includes('hoofddorp') || n.includes('harten')) return {
    location: 'Haarlemmermeer',
    region: 'Noord-Holland',
    tagline: 'Impact in de polder — hart van Haarlemmermeer',
    emoji: '💚',
  }
  if (n.includes('haarlem')) return {
    location: 'Haarlem',
    region: 'Noord-Holland',
    tagline: 'Ontdek de sociale kracht van Haarlem',
    emoji: '🏛️',
  }

  return {
    location: 'Nederland',
    region: 'Nederland',
    tagline: 'GPS-teambuilding met echte sociale impact',
    emoji: '📍',
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n💰 Bijwerken van tour prijzen en locatie-metadata...\n')

  const tours = await sql`
    SELECT id, name, variant, pricing_model, price_per_person_cents, price_in_cents, ai_config
    FROM tours
    ORDER BY created_at
  `

  console.log(`📋 ${tours.length} tours gevonden\n`)

  let updated = 0
  let skipped = 0

  for (const tour of tours) {
    const variant = tour.variant as string
    const name = tour.name as string

    // Uitzonderingen op standaard prijsmodel
    let pricing = PRICING[variant] ?? PRICING.wijktocht

    // Amsterdam Impact Wandeling: flat fee
    if (name.toLowerCase().includes('amsterdam') && variant === 'wijktocht' && name.toLowerCase().includes('wandeling')) {
      pricing = { model: 'flat', ppCents: 0, flatCents: 24900 }
    }

    const locationMeta = getLocationMeta(name, variant)

    // Merge met bestaande aiConfig (bewaar eventueel aanwezige velden)
    const existingConfig = (tour.ai_config as Record<string, unknown>) ?? {}
    const newConfig = {
      ...existingConfig,
      location: locationMeta.location,
      region: locationMeta.region,
      tagline: existingConfig.tagline || locationMeta.tagline,
      emoji: existingConfig.emoji || locationMeta.emoji,
    }

    await sql`
      UPDATE tours
      SET
        pricing_model = ${pricing.model},
        price_per_person_cents = ${pricing.ppCents},
        price_in_cents = ${pricing.flatCents},
        ai_config = ${JSON.stringify(newConfig)}::jsonb,
        updated_at = now()
      WHERE id = ${tour.id}
    `

    const priceStr = pricing.model === 'per_person'
      ? `€${(pricing.ppCents / 100).toFixed(0)} p.p.`
      : pricing.flatCents > 0
      ? `€${(pricing.flatCents / 100).toFixed(0)} vast`
      : 'Gratis'

    console.log(`  ✓ ${name}`)
    console.log(`    → Prijs: ${priceStr} | Locatie: ${locationMeta.location} ${locationMeta.emoji}`)
    updated++
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Prijsupdate compleet!
   ${updated} tours bijgewerkt | ${skipped} overgeslagen

💡 Prijsoverzicht (excl. BTW):
   WijkTocht:     €39 p.p.
   ImpactSprint:  €29 p.p.
   FamilieTocht:  €22 p.p.
   JeugdTocht:    €7,50 p.k.
   VoetbalMissie: €6 p.k.
   Amsterdam Wandeling: €249 vast

🌍 Geconfigureerde locaties:
   Haarlem, Heemstede, Haarlemmermeer, Amsterdam, Bunnik
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
