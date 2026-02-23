/**
 * Seeder: VoetbalMissie — Pre-gebouwde JeugdTocht voor 9-12 jaar
 *
 * Gebruik:
 *   bun scripts/seed-voetbalmissie.ts [spelleider-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-voetbalmissie.ts spelleider@impacttocht.nl
 *
 * Daarna: Pas de GPS-coördinaten aan via de kaarteditor in het admin dashboard.
 * De placeholder-coördinaten staan op Amsterdam-Centrum.
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// GPS placeholder: Amsterdam-Centrum (spelleider past dit aan via kaarteditor)
const BASE_LAT = 52.3756
const BASE_LNG = 4.8954

async function seedVoetbalMissie() {
  const spelleiderEmail = process.argv[2] || 'spelleider@impacttocht.nl'

  console.log('\n⚽ Seeding VoetbalMissie...\n')
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

  // ─── Tour aanmaken ───────────────────────────────────────────────────────────
  const storyFrame = {
    introText:
      'De trainer van jullie favoriete club is iets kwijtgeraakt — en alleen jullie kunnen het terugvinden. Maar onderweg moeten jullie bewijzen dat je een écht team bent. Zoek de aanwijzingen die hij in de wijk heeft achtergelaten!',
    finaleReveal:
      'De trainer onthult wat hij kwijt was: niet een voorwerp — maar het gevoel dat zijn team voor hem zorgt. Jullie hebben vandaag bewezen dat jullie een écht team zijn!',
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
      price_per_person_cents,
      story_frame,
      ai_config
    ) VALUES (
      'VoetbalMissie — De Verloren Trofee',
      'GPS-speurtocht voor voetbalteams van 9-12 jaar. De trainer is iets kwijtgeraakt — alleen jullie kunnen het terugvinden! Onderweg leren de jongens samenwerken, een onbekende aanspreken en iemand helpen. De maatschappelijke impact zit verstopt in de opdrachten — ze merken het pas achteraf.',
      'voetbalmissie',
      ${spelleider.id},
      true,
      105,
      4,
      6500,
      'per_person',
      600,
      ${JSON.stringify(storyFrame)},
      ${JSON.stringify({
        targetGroup: '9-12 jaar, voetbal-thema',
        teamSize: 5,
        themes: ['voetbal', 'samenwerking', 'buurt', 'sociale impact'],
        generatedAt: new Date().toISOString(),
      })}
    ) RETURNING id
  `

  console.log(`✓ Tour aangemaakt: VoetbalMissie (id: ${tour.id})`)

  // ─── Checkpoints aanmaken ────────────────────────────────────────────────────
  const checkpoints = [
    {
      orderIndex: 0,
      name: 'Checkpoint 1 — De Verkenner',
      type: 'kennismaking',
      missionTitle: 'De Verkenner — Zoek de Verloren Voetbalschoen',
      missionDescription:
        'Zoek in het park of op het speelplein de "verloren voetbalschoen" van de trainer — een prop papier met een aanwijzing erin verstopt. Hij heeft hem ergens in de struiken achtergelaten. Scan de QR-code op het briefje en luister naar zijn boodschap! Daarna: schrijf op het bordje van de lokale voetbalclub één idee op hoe jullie dit seizoen kunnen helpen.',
      missionType: 'opdracht',
      lat: BASE_LAT + 0.002,
      lng: BASE_LNG + 0.001,
      unlockRadius: 50,
      gmsConnection: 15,
      gmsMeaning: 10,
      gmsJoy: 15,
      gmsGrowth: 5,
      hint1: 'De trainer verstopt dingen graag in de buurt van groen — kijk bij bomen en struiken.',
      hint2: 'Het is een verfrommeld stukje papier, niet groter dan je hand. Kijk laag bij de grond.',
      hint3: 'Er hangt ook een klein bordje van de voetbalclub in de buurt — de schoen ligt vlakbij.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 1,
      name: 'Checkpoint 2 — De Teamspeler',
      type: 'samenwerking',
      missionTitle: 'De Teamspeler — Spreek een Onbekende Aan',
      missionDescription:
        'Zoek samen een volwassene die je nog niet kent — bij het buurthuis, de school of de sportkantine. Vraag beleefd: "Wat was uw favoriete sport als kind en waarom?" Noteer het antwoord hieronder. Bonus: maak een teamfoto met diegene voor extra punten!',
      missionType: 'opdracht',
      lat: BASE_LAT + 0.003,
      lng: BASE_LNG - 0.002,
      unlockRadius: 50,
      gmsConnection: 20,
      gmsMeaning: 15,
      gmsJoy: 10,
      gmsGrowth: 10,
      hint1: 'Kijk om je heen — er zijn vast volwassenen in de buurt van het gebouw.',
      hint2: 'Begin met "Mag ik u iets vragen?" — dat werkt altijd.',
      hint3: 'Als iemand nee zegt, is dat ook oké. Probeer dan een ander persoon aan te spreken.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 50,
    },
    {
      orderIndex: 2,
      name: 'Checkpoint 3 — De Dribbelaar',
      type: 'samenwerking',
      missionTitle: 'De Dribbelaar — Driehoeksdribble met Beperkingen',
      missionDescription:
        'Kies samen één teamlid dat de driehoeksdribble uitvoert. Maar let op — jullie hebben elk een beperking: één teamlid mag NIET praten, één mag NIET wijzen, één mag ALLEEN klapjes geven. Jullie moeten samenwerken zonder volledige vrijheid! Beschrijf hoe het ging en wat jullie leerden over samenwerken.',
      missionType: 'opdracht',
      lat: BASE_LAT - 0.001,
      lng: BASE_LNG + 0.003,
      unlockRadius: 50,
      gmsConnection: 20,
      gmsMeaning: 5,
      gmsJoy: 20,
      gmsGrowth: 20,
      hint1: 'Bespreek eerst wie welke beperking krijgt voordat jullie beginnen.',
      hint2: 'De persoon die niet mag praten kan andere signalen bedenken — knikken, zwaaien.',
      hint3: 'Het gaat niet om perfecte dribbles — het gaat om hoe jullie communiceren met beperkingen.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 3,
      name: 'Checkpoint 4 — De Assistent',
      type: 'actie',
      missionTitle: 'De Assistent — Help Iemand in de Buurt',
      missionDescription:
        'Bij dit checkpoint wacht een kleine klus op jullie! Jullie helpen iemand in de buurt — een tasje sjouwen, foldertjes sorteren of iets anders dat de spelleider heeft geregeld. Jullie hebben 8 minuten. Maak daarna een foto als bewijs van jullie hulp!',
      missionType: 'foto',
      lat: BASE_LAT - 0.002,
      lng: BASE_LNG - 0.001,
      unlockRadius: 50,
      gmsConnection: 15,
      gmsMeaning: 25,
      gmsJoy: 10,
      gmsGrowth: 10,
      hint1: 'De klus is al geregeld door de spelleider — vraag bij het gebouw wat jullie kunnen doen.',
      hint2: 'Verdeel het werk eerlijk — iedereen doet mee.',
      hint3: 'Vergeet niet een foto te maken als bewijs!',
      timeLimitSeconds: 480, // 8 minuten
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 4,
      name: 'Checkpoint 5 — De Finale',
      type: 'feest',
      missionTitle: 'De Finale — Wat Had de Trainer Verloren?',
      missionDescription:
        'Jullie zijn terug bij de start! De trainer onthult nu wat hij echt kwijt was... Niet een voorwerp — maar het gevoel dat zijn team voor hem zorgt. Presenteer in één zin jullie grootste vondst van vandaag. Wat hebben jullie geleerd? Wat nemen jullie mee?',
      missionType: 'opdracht',
      lat: BASE_LAT,
      lng: BASE_LNG,
      unlockRadius: 100, // ruimer voor de finalelocatie
      gmsConnection: 15,
      gmsMeaning: 20,
      gmsJoy: 20,
      gmsGrowth: 10,
      hint1: 'Denk terug aan de mooiste momenten van vandaag — welke verraste jullie het meest?',
      hint2: 'Wat vonden jullie het moeilijkst? En wat maakte jullie trots?',
      hint3: 'Eén zin, vanuit het hart — wat nemen jullie mee naar huis?',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
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
✅ VoetbalMissie succesvol aangemaakt!

   Tour ID: ${tour.id}
   Variant: voetbalmissie
   Prijs: €6/kind (per_person)

   Volgende stap: Pas de GPS-coördinaten aan via het admin dashboard:
   → /spelleider/tochten/${tour.id}/checkpoints

   Placeholder-locaties zijn nu op Amsterdam-Centrum.
   Stel ook de geofence in bij het aanmaken van een sessie (JeugdTocht-vereiste).
`)
}

seedVoetbalMissie().catch((e) => {
  console.error('❌ Seeder fout:', e)
  process.exit(1)
})
