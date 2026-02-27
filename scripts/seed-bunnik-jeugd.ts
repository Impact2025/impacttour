/**
 * Seeder: JeugdTocht Bunnik Centrum — 3 checkpoints, kids 10-13 jaar
 *
 * Gebruik:
 *   bun scripts/seed-bunnik-jeugd.ts [spelleider-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-bunnik-jeugd.ts jouw@email.nl
 *
 * Route: Dorpsplein → Dorpskerk → Kromme Rijn park (~400m loopafstand)
 * Duur: ~45-60 minuten
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// ── GPS coördinaten Bunnik Centrum ────────────────────────────────────────────
// CP1: Dorpsplein Bunnik
// CP2: Dorpskerk / Kerkpad
// CP3: Kromme Rijn oever / Groengebied

const CHECKPOINTS = [
  {
    orderIndex: 0,
    name: 'CP1 — Dorpsplein Bunnik',
    lat: 52.0657,
    lng: 5.2033,
  },
  {
    orderIndex: 1,
    name: 'CP2 — Bij de Dorpskerk',
    lat: 52.0663,
    lng: 5.2046,
  },
  {
    orderIndex: 2,
    name: 'CP3 — Kromme Rijn / Park',
    lat: 52.0674,
    lng: 5.2061,
  },
]

async function seedBunnikJeugd() {
  const spelleiderEmail = process.argv[2] || 'spelleider@impacttocht.nl'

  console.log('\n🏃 Seeding JeugdTocht Bunnik Centrum...\n')
  console.log(`  Spelleider: ${spelleiderEmail}`)

  // Zoek spelleider
  const [spelleider] = await sql`
    SELECT id FROM users WHERE email = ${spelleiderEmail} LIMIT 1
  `
  if (!spelleider) {
    console.error(`\n❌ Spelleider '${spelleiderEmail}' niet gevonden in de database.`)
    console.error('   Voer eerst de basis-seed uit: bun scripts/seed.ts\n')
    process.exit(1)
  }

  // ── Tour aanmaken ────────────────────────────────────────────────────────────
  const storyFrame = {
    introText:
      'Er is iets vreemds aan de hand in Bunnik. Drie plekken in het dorp verbergen geheime aanwijzingen — en alleen een goed team kan ze allemaal ontcijferen. Jullie missie: los alle opdrachten op en bewijs dat jullie het slimste en dapperste team van het dorp zijn!',
    finaleReveal:
      'Gefeliciteerd, agenten! Jullie hebben alle drie de geheime locaties gevonden en de opdrachten volbracht. Het geheim van Bunnik is nu veilig — dankzij jullie teamwerk!',
  }

  const [tour] = await sql`
    INSERT INTO tours (
      name,
      description,
      variant,
      created_by_id,
      is_published,
      estimated_duration_min,
      max_teams,
      price_in_cents,
      pricing_model,
      story_frame,
      ai_config
    ) VALUES (
      'JeugdTocht Bunnik — Geheimen van het Dorp',
      'Compacte GPS-speurtocht door Bunnik centrum voor kids van 10-13 jaar. Drie geheime locaties, uitdagende opdrachten en volop beweging. Route loopt langs Dorpsplein, Dorpskerk en de Kromme Rijn.',
      'jeugdtocht',
      ${spelleider.id},
      true,
      55,
      6,
      0,
      'flat',
      ${JSON.stringify(storyFrame)},
      ${JSON.stringify({
        targetGroup: '10-13 jaar',
        teamSize: '3-5 kinderen',
        themes: ['samenwerking', 'dorpsverkenning', 'bewegen', 'puzzels'],
        location: 'Bunnik centrum',
        generatedAt: new Date().toISOString(),
      })}
    ) RETURNING id
  `

  console.log(`✓ Tour aangemaakt: JeugdTocht Bunnik (id: ${tour.id})`)

  // ── Checkpoints aanmaken ──────────────────────────────────────────────────────
  const checkpoints = [
    {
      ...CHECKPOINTS[0],
      type: 'kennismaking',
      missionTitle: '🕵️ Operatie: Bunnik in Beeld',
      missionDescription:
        'Jullie zijn geheime fotografen! Jullie opdracht: maak één foto waarop jullie HEEL TEAM iets uitbeeldt dat typisch is voor dit plein of dit dorp. Geen woorden — alleen gebaren en poses! De spelleider kiest straks de meest creatieve foto. Schrijf ook op: wat hebben jullie uitgebeeld en waarom past dat bij Bunnik?',
      missionType: 'foto',
      unlockRadius: 50,
      gmsConnection: 15,
      gmsMeaning: 10,
      gmsJoy: 25,
      gmsGrowth: 10,
      hint1: 'Kijk om je heen: wat zie je hier dat nergens anders is? Een winkel, een bankje, een straatnaam?',
      hint2: 'Pose-ideeën: een standbeeld nadoen, iets bouwen met jullie lichamen, een activiteit uitbeelden die je hier doet.',
      hint3: 'Countdown van 3 — dan iedereen bevroren in de pose. Één iemand maakt de foto, de rest houdt stand!',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      ...CHECKPOINTS[1],
      type: 'samenwerking',
      missionTitle: '🔔 De Torenwacht — Hoe Goed Kijk Jij?',
      missionDescription:
        'De Dorpskerk heeft geheimen voor wie goed kijkt! Jullie krijgen 3 minuten om samen deze vragen te beantwoorden ZONDER telefoon te gebruiken voor opzoeken:\n\n1. Hoeveel ramen heeft de kerktoren die je kunt tellen?\n2. Welke kleur heeft de voordeur van de kerk?\n3. Staat er ergens een naam of jaar op de buitenkant? Wat staat er?\n4. Bedenk zelf: wat zou dit gebouw vroeger zijn geweest als het geen kerk was?\n\nBeantwoord ALLES samen — iedereen mag één antwoord zeker weten, niemand mag alles doen!',
      missionType: 'opdracht',
      unlockRadius: 50,
      gmsConnection: 20,
      gmsMeaning: 15,
      gmsJoy: 10,
      gmsGrowth: 20,
      hint1: 'Begin bij vraag 1 — loopt er iemand een rondje terwijl de rest alvast de andere vragen beantwoordt?',
      hint2: 'Vraag 4 is mening, niet kennis. Er is geen fout antwoord — het meest originele antwoord krijgt extra punten!',
      hint3: 'Twijfel je over het aantal ramen? Tel van onder naar boven per rij, dan optellen.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      ...CHECKPOINTS[2],
      type: 'actie',
      missionTitle: '🌊 Rivierrace — Snelste Team Wint!',
      missionDescription:
        'Jullie staan bij de Kromme Rijn — tijd voor de finale! Twee uitdagingen, één winnaar:\n\n**RONDE 1 — Menselijke Slalom:** 3 teamleden staan als pylonen (benen wijd). De anderen rennen in slalom erdoorheen. Pylonen mogen bewegen maar niet lopen! Tel hoeveel complete ronden jullie in 45 seconden halen.\n\n**RONDE 2 — Team Estafette:** Bedenk zelf een estafette met iets wat jullie bij je hebben of vinden (steen, blaadje, tas). Minstens 3 wissels, minstens 10 meter. Doe hem 3 keer en verbeter elke keer.\n\nSchrijf op: jullie slalom-score EN beschrijf jullie estafette (wat wisselden jullie, hoe ver, wie was snelst?)',
      missionType: 'opdracht',
      unlockRadius: 60,
      gmsConnection: 15,
      gmsMeaning: 5,
      gmsJoy: 30,
      gmsGrowth: 20,
      hint1: 'Slalom tip: pylonen mogen hun armen bewegen om de lopers lastig te maken — dat is toegestaan!',
      hint2: 'Estafette: een steen doorgeven werkt prima, maar creatievere keuzes leveren meer punten op bij de spelleider.',
      hint3: 'Verbetertip: na ronde 1 en 2 overleg je 10 seconden — wat ging fout? Dan ronde 3 met die aanpassing.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 25,
    },
  ]

  for (const cp of checkpoints) {
    await sql`
      INSERT INTO checkpoints (
        tour_id,
        order_index,
        name,
        type,
        latitude,
        longitude,
        unlock_radius_meters,
        mission_title,
        mission_description,
        mission_type,
        gms_connection,
        gms_meaning,
        gms_joy,
        gms_growth,
        hint1,
        hint2,
        hint3,
        time_limit_seconds,
        bonus_photo_points,
        is_kids_friendly
      ) VALUES (
        ${tour.id},
        ${cp.orderIndex},
        ${cp.name},
        ${cp.type},
        ${cp.lat},
        ${cp.lng},
        ${cp.unlockRadius},
        ${cp.missionTitle},
        ${cp.missionDescription},
        ${cp.missionType},
        ${cp.gmsConnection},
        ${cp.gmsMeaning},
        ${cp.gmsJoy},
        ${cp.gmsGrowth},
        ${cp.hint1},
        ${cp.hint2},
        ${cp.hint3},
        ${cp.timeLimitSeconds},
        ${cp.bonusPhotoPoints},
        true
      )
    `
    console.log(`  ✓ CP${cp.orderIndex + 1}: ${cp.name}`)
  }

  console.log(`
✅ JeugdTocht Bunnik succesvol aangemaakt!

   Tour ID  : ${tour.id}
   Variant  : jeugdtocht (kids-safe, geen chat, hint-knoppen)
   Route    : Dorpsplein → Dorpskerk → Kromme Rijn (~400m)
   Duur     : ~45-55 minuten
   Teams    : max 6

   ─────────────────────────────────────────────────────
   VOLGENDE STAPPEN:

   1. Check GPS punten morgen ter plekke — pas aan via:
      /admin/tochten → selecteer tour → edit checkpoints

   2. Maak een game sessie aan vóór je vertrekt:
      /spelleider/tochten/${tour.id}

   3. Kids-vereisten actief:
      ✓ Geen PII (alleen teamnaam + token)
      ✓ Geen chat (Flits hint-knoppen)
      ✓ Foto's worden na 30 dagen verwijderd
      ✓ Stel geofence in bij aanmaken sessie!

   4. CP3 heeft bonusPhotoPoints=25 voor de estafette-foto.
   ─────────────────────────────────────────────────────
`)
}

seedBunnikJeugd().catch((e) => {
  console.error('❌ Seeder fout:', e)
  process.exit(1)
})
