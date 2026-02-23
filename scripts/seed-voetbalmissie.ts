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
      name: 'Checkpoint 1 — De Spotter',
      type: 'kennismaking',
      missionTitle: '🕵️ Scoutingrapport: Is Dit Voetballand?',
      missionDescription:
        'Jullie zijn talent-scouts voor een Eredivisie-club. Zoek het meest CREATIEVE ding in de buurt dat als goal kan dienen — een hek, prullenbak, bankje, maakt niet uit. Heel team erbij en IEDEREEN doet een overdreven goal-viering! Schrijf op: geef deze plek een cijfer van 1-10 als voetballocatie. En wie had de meest dramatische viering?',
      missionType: 'foto',
      lat: BASE_LAT + 0.002,
      lng: BASE_LNG + 0.001,
      unlockRadius: 50,
      gmsConnection: 10,
      gmsMeaning: 5,
      gmsJoy: 20,
      gmsGrowth: 10,
      hint1: 'Denk groot — een goal hoeft geen echte goal te zijn. Kijk naar alles met twee palen of een opening.',
      hint2: 'De viering telt mee voor punten — ga all-in! Denk aan Ronaldo, Mbappe of Dansen.',
      hint3: 'Geen inspiratie? Zet iemand naast de "goal" als keeper en fotografeer de schutter.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 1,
      name: 'Checkpoint 2 — De Straatinterviewer',
      type: 'samenwerking',
      missionTitle: '🎤 Voetbalwijsheid van de Straat',
      missionDescription:
        'Zoek iemand die je NIET kent — hoe ouder hoe beter. Stel deze vraag: "Als u morgen voor één dag een profvoetballer bent, wie bent u dan en waarom?" Schrijf het antwoord op. Hoe gekker het antwoord, hoe beter! Bonus: vraag of ze hun goal-viering mogen voordoen en maak een foto. Extra bonus als ze het ook echt doen!',
      missionType: 'opdracht',
      lat: BASE_LAT + 0.003,
      lng: BASE_LNG - 0.002,
      unlockRadius: 50,
      gmsConnection: 20,
      gmsMeaning: 10,
      gmsJoy: 15,
      gmsGrowth: 10,
      hint1: 'Begin met: "Mag ik u iets vragen voor een voetbalmissie?" — werkt bijna altijd!',
      hint2: 'Als iemand nee zegt: geen probleem, gewoon de volgende proberen. Elke team spreekt minstens 1 persoon aan.',
      hint3: 'Hoe serieuzer jij de vraag stelt, hoe leuker het antwoord. Doe alsof het een echte reportage is!',
      timeLimitSeconds: null,
      bonusPhotoPoints: 50,
    },
    {
      orderIndex: 2,
      name: 'Checkpoint 3 — De Pylonen',
      type: 'samenwerking',
      missionTitle: '⚡ Menselijke Pylonen — Beat the Record',
      missionDescription:
        'Jullie maken zelf een slalom! 3 teamleden staan als pylonen: benen wijd, armen omhoog. De anderen sprint zigzag ER DOORHEEN zonder iemand aan te tikken. Maar de pylonen mogen bewegen! Jullie hebben 45 seconden — tel hoe vaak jullie de hele slalom compleet door zijn gegaan. Schrijf het record op + de naam van jullie snelste pyloon en jullie snelste loper.',
      missionType: 'opdracht',
      lat: BASE_LAT - 0.001,
      lng: BASE_LNG + 0.003,
      unlockRadius: 50,
      gmsConnection: 15,
      gmsMeaning: 5,
      gmsJoy: 25,
      gmsGrowth: 15,
      hint1: 'Zet de pylonen op minstens 2 meter afstand van elkaar, anders is het te makkelijk.',
      hint2: 'Pylonen mogen hun benen bewegen maar niet hun voeten verplaatsen — maakt het lastiger!',
      hint3: 'Tellen en aanmoedigen telt ook mee — iedereen heeft een rol.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 3,
      name: 'Checkpoint 4 — De Community Champions',
      type: 'actie',
      missionTitle: '🦸 Community Champions: 8 Minuten Held',
      missionDescription:
        'Dit is geen oefening — jullie helpen echt iemand in de buurt! De spelleider heeft een klus geregeld. Jullie hebben 8 minuten. Verdeel het werk slim: iedereen doet iets. Na de klus: foto met de persoon die jullie hielpen. Iedereen duim omhoog. Schrijf ook op: wat was de klus en wie was jullie MVP (meest waardevolle helper)?',
      missionType: 'foto',
      lat: BASE_LAT - 0.002,
      lng: BASE_LNG - 0.001,
      unlockRadius: 50,
      gmsConnection: 15,
      gmsMeaning: 25,
      gmsJoy: 10,
      gmsGrowth: 10,
      hint1: 'Vraag bij aankomst: "Wij zijn de Community Champions, wat mogen wij voor u doen?" Werkt gegarandeerd.',
      hint2: 'Verdeel de rollen: één aanvoerder die de leiding neemt, de rest volgt direct.',
      hint3: 'Foto niet vergeten — de persoon die geholpen is MOET op de foto!',
      timeLimitSeconds: 480,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 4,
      name: 'Checkpoint 5 — De Kampioensceremonie',
      type: 'feest',
      missionTitle: '🏆 Jullie Eigen Goal Celebration — Voor Altijd',
      missionDescription:
        'Missie geslaagd! Jullie trainer heeft teruggevonden wat hij kwijt was. Nu mag het feest beginnen. Jullie team verdient een eigen goal celebration — één die jullie de rest van het seizoen gebruiken als jullie scoren. Bedenk hem samen: 3 bewegingen + een teamroep. Oefen hem 3 keer tot hij perfect zit. Beschrijf hem in het antwoord: beweging 1, beweging 2, beweging 3, teamroep. Op welke echte viering lijkt hij het meest?',
      missionType: 'opdracht',
      lat: BASE_LAT,
      lng: BASE_LNG,
      unlockRadius: 100,
      gmsConnection: 20,
      gmsMeaning: 15,
      gmsJoy: 20,
      gmsGrowth: 10,
      hint1: 'Denk aan de beste goal celebrations die jullie kennen — Ronaldo "SIIII", Dansen, De Robot. Mixen mag!',
      hint2: 'De teamroep moet iedereen tegelijk zeggen — oefen het zodat het klinkt als één stem.',
      hint3: 'Beweging 1 = opstarten, beweging 2 = het mooiste moment, beweging 3 = de eindpose. Dan de roep!',
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
