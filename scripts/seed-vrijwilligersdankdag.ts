/**
 * Seeder: Vrijwilligers Dankdag — kant-en-klare erkennings- & impacttocht
 *
 * Gebruik:
 *   bun scripts/seed-vrijwilligersdankdag.ts [spelleider-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-vrijwilligersdankdag.ts spelleider@impacttocht.nl
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

async function seedVrijwilligersDankdag() {
  const spelleiderEmail = process.argv[2] || 'spelleider@impacttocht.nl'

  console.log('\n💚 Seeding Vrijwilligers Dankdag...\n')
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

  // Voorkom dubbele aanmaak
  const [existing] = await sql`
    SELECT id FROM tours WHERE variant = 'vrijwilligersdankdag' LIMIT 1
  `
  if (existing) {
    console.log(`\n⚠️ Er bestaat al een Vrijwilligers Dankdag-tocht (id: ${existing.id}). Geen nieuwe aangemaakt.`)
    process.exit(0)
  }

  // ─── Tour aanmaken ───────────────────────────────────────────────────────────
  const storyFrame = {
    introText:
      'Vandaag draait het niet om de organisatie, maar om jou. Jij maakt het verschil — in je buurt, bij een vereniging, in een instelling. Tijdens deze tocht staan verbinding, betekenis en plezier centraal. Laat zien wat jij betekent, en ontdek wat anderen voor jóu betekenen.',
    finaleReveal:
      'Deze dag was geen uitje, maar een eerbetoon. Jij bent de reden dat een club draait, een buurt leeft, een instelling menselijk blijft. Neem dat mee — ver na vandaag.',
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
      'Impact Vrijwilligers Dankdag — Erkenning & Verbinding',
      'Een betekenisvolle GPS-tocht voor vrijwilligers van gemeenten, welzijnsorganisaties, cultuurinstellingen, buurthuizen, zorginstellingen en sociale stichtingen. 5–7 checkpoints rond erkenning, verbinding, betekenis, plezier en groei — met een warm welkom en een feestelijke afsluiting. Ideaal rond Vrijwilligersdag.',
      'vrijwilligersdankdag',
      ${spelleider.id},
      true,
      180,
      12,
      0,
      'per_person',
      1200,
      ${JSON.stringify(storyFrame)},
      ${JSON.stringify({
        targetGroup: 'Vrijwilligers (18+), gemeenten/welzijn/cultuur/sport/zorg',
        teamSize: 4,
        themes: ['erkenning', 'verbinding', 'betekenis', 'vrijwilligersdag', 'impact'],
        generatedAt: new Date().toISOString(),
      })}
    ) RETURNING id
  `

  console.log(`✓ Tour aangemaakt: Vrijwilligers Dankdag (id: ${tour.id})`)

  // ─── Checkpoints aanmaken ────────────────────────────────────────────────────
  const checkpoints = [
    {
      orderIndex: 0,
      name: 'Checkpoint 1 — Het begin',
      type: 'kennismaking',
      missionTitle: 'Waarom jij hier staat',
      missionDescription:
        'Maak een foto van iets in de buurt dat jou motiveert om vrijwilliger te zijn. Leg in één zin uit wat dat ene ding met jouw inzet te maken heeft. Deel daarna in je team wat jou hiernaartoe heeft gebracht.',
      missionType: 'foto',
      lat: BASE_LAT + 0.002,
      lng: BASE_LNG + 0.001,
      unlockRadius: 60,
      gmsConnection: 15,
      gmsMeaning: 20,
      gmsJoy: 10,
      gmsGrowth: 10,
      hint1: 'Kijk om je heen: een bankje, een muur, een gebouw — alles kan symbool staan voor iemands motivatie.',
      hint2: 'De foto telt, maar de één-zin-uitleg levert de meeste punten op.',
      hint3: 'Geen inspiratie? Fotografeer het gezicht van een teamgenoot en schrijf waaróm die persoon je motiveert.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 1,
      name: 'Checkpoint 2 — Verbinding',
      type: 'samenwerking',
      missionTitle: 'Samen iets moois',
      missionDescription:
        'Deel met je team een moment waarop jullie samen iets moois hebben bereikt. Niet als organisatie, maar als groep mensen die er voor elkaar zijn. Schrijf op wat dat moment zo bijzonder maakte en wie je daarbij nodig had.',
      missionType: 'opdracht',
      lat: BASE_LAT + 0.003,
      lng: BASE_LNG - 0.002,
      unlockRadius: 60,
      gmsConnection: 25,
      gmsMeaning: 10,
      gmsJoy: 15,
      gmsGrowth: 10,
      hint1: 'Denk aan een buurtfeest, een actie, een moeilijk moment dat jullie samen droegen.',
      hint2: 'Laat iedereen in het team minimaal één zin vertellen — luisteren is onderdeel van de opdracht.',
      hint3: 'Schrijf het op alsof het een anekdote is die je later aan een nieuwe vrijwilliger vertelt.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 2,
      name: 'Checkpoint 3 — Impact',
      type: 'actie',
      missionTitle: 'Wie heb je geraakt?',
      missionDescription:
        'Wie heb je dit jaar geraakt met je inzet? Leg het vast — een naam, een moment, een verhaal. Beschrijf concreet wat er veranderde voor die persoon omdat jij er was.',
      missionType: 'opdracht',
      lat: BASE_LAT - 0.001,
      lng: BASE_LNG + 0.003,
      unlockRadius: 60,
      gmsConnection: 10,
      gmsMeaning: 25,
      gmsJoy: 10,
      gmsGrowth: 15,
      hint1: 'Impact hoeft niet groot te zijn — één glimlach of één telefoontje kan het verschil maken.',
      hint2: 'Wees specifiek: "door X deed Y weer Z" scoort hoger dan algemeen taalgebruik.',
      hint3: 'Mag anoniem — een initiaal of "een bewoner" is genoeg.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 3,
      name: 'Checkpoint 4 — Plezier',
      type: 'feest',
      missionTitle: 'Fun-opdracht + viering',
      missionDescription:
        'Tijd om te vieren dat je bestaat als vrijwilliger! Verzin met je team een korte, overdreven "vrijwilligers-viering": een pose + een teamroep. Oefen hem en zet hem op video. Bonus als voorbijgangers meedoen.',
      missionType: 'video',
      lat: BASE_LAT - 0.002,
      lng: BASE_LNG - 0.001,
      unlockRadius: 60,
      gmsConnection: 15,
      gmsMeaning: 5,
      gmsJoy: 25,
      gmsGrowth: 10,
      hint1: 'Denk aan sportvieringen, een dansje, of een gezamenlijke pose.',
      hint2: 'De teamroep moet iedereen tegelijk zeggen — oefen tot het klinkt als één stem.',
      hint3: 'Een voorbijganger die meedoet levert bonuspunten op — durf te vragen!',
      timeLimitSeconds: 300,
      bonusPhotoPoints: 50,
    },
    {
      orderIndex: 4,
      name: 'Checkpoint 5 — Dankbaarheid',
      type: 'reflectie',
      missionTitle: 'Een bedankje dat later bezorgd wordt',
      missionDescription:
        'Schrijf een persoonlijk bedankje aan een medevrijwilliger — iemand die jij bewondert om wie ze zijn of wat ze doen. De organisatie bezorgt het na afloop. Schrijf minstens drie zinnen: wat doet die persoon, wat betekent dat voor jou, en waarom ben je dankbaar.',
      missionType: 'opdracht',
      lat: BASE_LAT,
      lng: BASE_LNG + 0.002,
      unlockRadius: 80,
      gmsConnection: 20,
      gmsMeaning: 15,
      gmsJoy: 10,
      gmsGrowth: 10,
      hint1: 'Noem iets concreets dat die persoon deed — dat maakt een bedankje oprecht.',
      hint2: 'Twijfel je aan de naam? Vraag het je teamgenoten.',
      hint3: 'Het hoeft niet lang — drie eerlijke zinnen zijn waardevoller dan een hele brief.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 5,
      name: 'Checkpoint 6 — Toekomst',
      type: 'reflectie',
      missionTitle: 'Wat gun je volgend jaar?',
      missionDescription:
        'Wat gun je jezelf en de organisatie volgend jaar? Schrijf één wens voor jezelf en één voor de organisatie. Denk aan groei, verbinding of impact die je nog wilt maken.',
      missionType: 'opdracht',
      lat: BASE_LAT + 0.001,
      lng: BASE_LNG - 0.003,
      unlockRadius: 80,
      gmsConnection: 10,
      gmsMeaning: 10,
      gmsJoy: 10,
      gmsGrowth: 25,
      hint1: 'Een wens mag klein zijn: "weer één nieuwe vrijwilliger vinden" telt net zo zwaar.',
      hint2: 'Koppel je wens aan iets concreets dat je dit jaar leerde.',
      hint3: 'Deel je wens hardop met je team — zo wordt het een afspraak.',
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
        false
      )
    `
    console.log(`  ✓ CP${cp.orderIndex + 1}: ${cp.name}`)
  }

  console.log(`
✅ Vrijwilligers Dankdag succesvol aangemaakt!

   Tour ID: ${tour.id}
   Variant: vrijwilligersdankdag
   Prijs: €12/p.p. (per_person)
   Checkpoints: 6 (erkenning, verbinding, impact, plezier, dankbaarheid, toekomst)

   Volgende stap: Pas de GPS-coördinaten aan via het admin dashboard:
   → /spelleider/tochten/${tour.id}/checkpoints

   Placeholder-locaties zijn nu op Amsterdam-Centrum.
   Tip: koppel een sessie aan deze tocht voor een Dankdag rond Vrijwilligersdag.
`)
}

seedVrijwilligersDankdag().catch((e) => {
  console.error('❌ Seeder fout:', e)
  process.exit(1)
})
