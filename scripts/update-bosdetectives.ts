/**
 * Update script: De Bosdetectives — CP1 en CP3 aanpassen voor kids 10 + 14 jaar
 *
 * Uitvoeren:
 *   bunx tsx scripts/update-bosdetectives.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const TOUR_ID = 'e24e90ce-bb62-4601-9e1d-85f5ebb01c55'

async function update() {
  console.log('\n✏️  Updating De Bosdetectives checkpoints...\n')

  // ─── CP1 (order_index 0): Dieren tellen → competitie-element ──────────────
  await sql`
    UPDATE checkpoints SET
      mission_title = 'De Telwedstrijd — Iedereen voor zich!',
      mission_description = ${'🦆 Jullie gaan dieren tellen — maar IEDEREEN telt los van elkaar!\n\nRegels:\n• 2 minuten stilte: iedereen loopt zijn eigen rondje rond de vijver\n• Niemand mag zijn score zeggen voordat de tijd om is\n• Dan vergelijken — wie had de scherpste ogen?\n\nPunten per dier:\n🦆 Eend = 1 punt\n🪿 Gans = 2 punten\n🐸 Kikker = 5 punten\n🦅 Iets onverwachts (roofvogel, reiger, waterrat...) = 10 punten!\n\nMaak daarna een foto van het grappigste of meest bijzondere wat jullie zagen. Bespreek: wie was er het meest verbaasd door de uitkomst?'}
    WHERE tour_id = ${TOUR_ID} AND order_index = 0
  `
  console.log('✓ CP1 (Grote Vijver) — competitie-element toegevoegd')

  // ─── CP3 (order_index 2): Boskunst → De Spoorzoeker ──────────────────────
  await sql`
    UPDATE checkpoints SET
      name = 'De Geheime Open Plek — Forensisch Onderzoek',
      mission_title = 'De Spoorzoeker',
      mission_description = ${'🔍 Jullie zijn nu forensisch onderzoekers. Bewijs dat er dieren leven in dit bos!\n\nZoek samen minimaal 5 bewijzen van dierenleven:\n• Uitwerpselen 💩\n• Pootafdrukken 🐾\n• Knaagsporen aan bomen of takken\n• Veren of haarplukjes\n• Holletjes, nestjes, graafsporen\n• Geschudde schors of losse takken\n\n📸 Fotografeer elk bewijs.\n\n🧪 De oudste is de forensisch expert en legt bij elke foto uit: "Dit is gemaakt door een [dier] omdat..."\nDe jongste is de spotter en wijst de volgende plek aan.\n\nWelk bewijs vinden jullie het meest indrukwekkend?'}
    WHERE tour_id = ${TOUR_ID} AND order_index = 2
  `
  console.log('✓ CP3 (Open Plek) — boskunst vervangen door Spoorzoeker opdracht')

  console.log('\n✅ Klaar! De Bosdetectives is nu klaar voor kids van 10 én 14 jaar.\n')
}

update().catch((e) => {
  console.error(e)
  process.exit(1)
})
