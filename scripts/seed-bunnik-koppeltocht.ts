/**
 * Seed: Bunnik KoppelTocht — Romantische wandeling voor twee 💞
 *
 * Gebaseerd op het Beleidsplan Toerisme (Kromme Rijnstreek) en het Strategisch
 * Adviesrapport "De Synergie van Natuur, Beweging en Relatieherstel".
 *
 * Gebruik:
 *   bun scripts/seed-bunnik-koppeltocht.ts [spelleider-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-bunnik-koppeltocht.ts spelleider@impacttocht.nl
 *
 * Wat dit maakt:
 *   - Tour "Bunnik — KoppelTocht" (6 checkpoints, ~5 km wandelen)
 *   - Game sessie in TEST MODE
 *   - Team "Ons Duo" met join token
 *
 * Route (te voet, start Station Bunnik):
 *   Start Station Bunnik
 *   → Theehuis Rhijnauwen (lindelaan — liefde-anker)
 *   → Kromme Rijn jaagpad (water — communicatie-anker)
 *   → De Veldkeuken (boomgaard — oogst/toekomst-anker)
 *   → Oud-Amelisweerd (Domtoren-zichtlijn — bewondering)
 *   → Bunnik Dorpsplein / Kromme Rijn (finale: 6-secondenkus + belofte)
 *   Ca. 2 uur incl. missies. Wandelen ~5 km (relaxed < 1 uur lopen).
 *
 * GPS-coördinaten zijn via Nominatim/OpenStreetMap gegeocodeerd (±20 m).
 * Fine-tune eventueel via /admin/tochten → edit checkpoints.
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// ─── Route: Bunnik KoppelTocht (te voet, start Station Bunnik) ────────────────
// Start:  52.0632104, 5.1957958 — Station Bunnik (ontmoetingspunt / OV)
// Finish: 52.0657,    5.2033     — Bunnik Dorpsplein / Kromme Rijn brug

const checkpoints = [
  {
    orderIndex: 0,
    name: 'CP1 — Station Bunnik: Jullie Vertrekpunt',
    type: 'kennismaking',
    missionTitle: '💞 De Kaart Van Nu (Love Map Update)',
    missionDescription: `Jullie ontmoeten elkaar op Station Bunnik. Voor jullie de groene streek in lopen, nemen jullie 2 minuten.
Dit is jullie Love Map-update — de levende versie van elkaars innerlijke wereld (Gottman).

Elk voor zichzelf, hardop:
1. Eén ding waar je oprecht dankbaar voor bent in ons, op dit moment.
2. Één vraag die je al een tijdje wilde stellen — maar waar je niet aan toekwam.

Geen kleine vragen ("wat eten we vanavond?"). Iets echts.
Luister écht naar het antwoord van de ander. Telefoon blijft in de zak.

Typ in je antwoord: jullie twee vragen + het ene ding dat jij noemde als dankbaarheid.`,
    missionType: 'opdracht',
    lat: 52.0632104,
    lng: 5.1957958,
    unlockRadius: 55,
    gmsConnection: 25,
    gmsMeaning: 20,
    gmsJoy: 10,
    gmsGrowth: 10,
    hint1: 'Goede opener: "Waar kijk jij het meest naar uit vandaag, met jou en mij?"',
    hint2: 'Een vraag die je al lang zit: "Wat mis je het meest als we een drukke week hebben?"',
    hint3: 'Het gaat om het stellen, niet om het perfecte antwoord. Hardop is het punt.',
    navigationHint:
      'Start bij de uitgang van Station Bunnik. Loop westwaarts het dorp uit, de groene rand van Rhijnauwen in. Volg de borden "Landgoed Rhijnauwen".',
  },
  {
    orderIndex: 1,
    name: 'CP2 — Theehuis Rhijnauwen: De Lindeboom',
    type: 'samenwerking',
    missionTitle: '🌳 Waar Jullie Samen Staan',
    missionDescription: `Rhijnauwen is beroemd om zijn lindelanen. Die lanen zijn geen toeval: de Kringenwet (1814) verbood bebouwing in de schootsvelden, waardoor die weidsheid en die lanen behouden bleven — nu het karakteristieke "open" landschap van de streek.

In de volksvertelling is de linde de boom van liefde en intimiteit. Hier past maar één opdracht:

1. Zoek samen één boom uit die "jullie boom" wordt. Niet de grootste — de juiste.
2. Eén van jullie leunt achterover in de armen van de ander (vertrouwen — letterlijk steunen).
3. Elk zegt één woord voor hoe je je nu voelt, terwijl je de boom aanraakt.

Maak een foto van "jullie boom" als jullie willen. Het woord van de ander onthouden jullie voor straks.`,
    missionType: 'foto',
    lat: 52.0698552,
    lng: 5.1779236,
    unlockRadius: 55,
    gmsConnection: 20,
    gmsMeaning: 15,
    gmsJoy: 20,
    gmsGrowth: 10,
    hint1: 'De lindes staan langs de hoofdlaan richting het theehuis — kijk omhoog, niet op je telefoon.',
    hint2: 'Het "leunen" hoeft niet lang. 5 seconden steun is genoeg om het vertrouwens-gevoel te voelen.',
    hint3: 'Geen goed woord? Begin met: "rustig", "blij", "verwonderd". Eerlijk wint het van mooi.',
    navigationHint:
      'Vanaf het station loop je westwaarts het landgoed in. CP2 ligt bij Theehuis Rhijnauwen, aan het einde van de centrale laan. ~1,4 km, ca. 18 min.',
  },
  {
    orderIndex: 2,
    name: 'CP3 — Kromme Rijn Jaagpad: De Stroom',
    type: 'reflectie',
    missionTitle: '🌊 Laat Het Los',
    missionDescription: `De Kromme Rijn stroomt hier langs het jaagpad — eeuwenlang de route van trekschuiten. Water staat in dit model voor de stroom van communicatie en het loslaten van oude blokkades.

Eerst de co-regulatie (Gottman / mindful): loop 5 minuten volledig in stilte naast elkaar, sync je ademhaling en je pas. Geen woorden, alleen stap en stroom.

Daarna, aan het water:
Benoem elk één ding dat je de laatste tijd met je meedroeg — en dat je vandaag de rivier laat meenemen. Iets dat zwaar was. Iets dat jullie niet meer nodig hebben.

Typ in je antwoord: het ene woord of zin dat jij liet gaan.`,
    missionType: 'opdracht',
    lat: 52.0679024,
    lng: 5.1778584,
    unlockRadius: 50,
    gmsConnection: 15,
    gmsMeaning: 20,
    gmsJoy: 10,
    gmsGrowth: 20,
    hint1: 'De stilte is de opdracht. Dwars door de verleiding heen om "even iets te zeggen" — 5 minuten is kort maar voelt lang.',
    hint2: 'Iets loslaten hoeft geen conflict te zijn. "Die ene stress over werk" telt ook.',
    hint3: 'Sta stil bij het water, kijk naar de stroming, en zeg het hardop — alsof je het aan de rivier geeft.',
    navigationHint:
      'Vanaf Theehuis Rhijnauwen loop je een paar honderd meter zuidwaarts naar de oever van de Kromme Rijn (jaagpad).',
  },
  {
    orderIndex: 3,
    name: 'CP4 — De Veldkeuken: De Oogst',
    type: 'actie',
    missionTitle: '🍎 Wat Willen We Samen Kweken?',
    missionDescription: `De Veldkeuken ligt midden in de boomgaard. In het toerisme-beleid geldt horeca hier als "revenue model for conservation" — jullie koffie helpt het landgoed te behouden. Mooi symbool: iets kleins dat jullie delen, geeft iets groters terug.

De boomgaard is het anker voor vruchtbaarheid en gezamenlijke oogst — jullie toekomst.

Opdracht:
1. Kies samen één klein ding dat jullie dit seizoen samen willen "kweken" — concreet, geen "misschien". Een ritueel, een uitje, een gewoonte.
2. Maak er iets tastbaars van: koop iets kleins om te delen (een appel, een koek, koffie), of leg een steen/blaadje neer als zaadje.
3. Foto met de boomgaard op de achtergrond.

Typ in je antwoord: jullie ene "oogst" voor dit seizoen.`,
    missionType: 'foto',
    lat: 52.0674533,
    lng: 5.1702164,
    unlockRadius: 55,
    gmsConnection: 15,
    gmsMeaning: 25,
    gmsJoy: 20,
    gmsGrowth: 15,
    hint1: 'Klein is beter dan groot: "elke zondag samen ontbijten" wint van "wereldreis maken".',
    hint2: 'De Veldkeuken is geopend voor koffie/gebak — een mooi moment om jullie "zaadje" te vieren.',
    hint3: 'Twijfel je? Kies het ding dat je al weken wil voorstellen maar steeds uitstelt.',
    navigationHint:
      'Vanaf de Kromme Rijn loop je westwaarts door het groen naar De Veldkeuken (aan de rand van de boomgaard). ~0,7 km.',
  },
  {
    orderIndex: 4,
    name: 'CP5 — Oud-Amelisweerd: De Lange Lijn',
    type: 'reflectie',
    missionTitle: '⛪ Waar Ik Trots Op Ben',
    missionDescription: `Oud-Amelisweerd is beroemd om zijn laan die — over eeuwen en kilometers — de Domtoren in Utrecht zichtbaar houdt. Die "lange lijn" is geen toeval: de Kringenwet schiep die open zichtlijnen. Een blik die de eeuwen overbrugt.

Gottman noemt Fondness & Admiration (Genegenheid en Bewondering) geen gevoel maar een discipline: het bewust benoemen van het goede in de ander.

Sta in die lange zichtlijn. Kijk elkaar aan. Elk noemt hardop één kwaliteit in de ander waar je diep onder de indruk van bent.
Geen "ach, dat stelt niks voor." Geen relativeren. Alleen benoemen. En ontvangen.

Typ in je antwoord: de kwaliteit die jouw partner noemde over jou.`,
    missionType: 'opdracht',
    lat: 52.0686771,
    lng: 5.1678867,
    unlockRadius: 55,
    gmsConnection: 20,
    gmsMeaning: 25,
    gmsJoy: 5,
    gmsGrowth: 15,
    hint1: 'Begin met: "Ik bewonder aan jou dat je altijd..." — en maak het concreet.',
    hint2: 'De lange laan staat er nog steeds; jullie blik op elkaar mag net zo steady zijn.',
    hint3: 'Ontvangen is ook een opdracht. Zeg "dankjewel" in plaats van het kleiner te maken.',
    navigationHint:
      'Vanaf De Veldkeuken loop je een paar honderd meter westwaarts naar landgoed Oud-Amelisweerd, de laan met de Domtoren-zichtlijn.',
  },
  {
    orderIndex: 5,
    name: 'CP6 — Bunnik Dorpsplein: Jullie Belofte',
    type: 'feest',
    missionTitle: '💋 De 6 Seconden',
    missionDescription: `Jullie zijn terug bij het dorp, bij de Kromme Rijn. Dit is het laatste checkpoint — en het belangrijkste.

Eerst de 6-secondenkus (oxytocine-boost uit het model): kus elkaar 6 seconden lang, vol aandacht. Niet de snelle "doei-kus" — de langzame.

Daarna, elk hardop één concrete belofte voor het komende jaar. Niet "misschien", niet "als het lukt". Iets wat je echt wil.
Zeg het hardop aan elkaar. Dit is jullie KoppelTocht-manifest.

Maak een foto samen op de brug over de Kromme Rijn.
Typ in je antwoord: jullie twee beloftes voor dit jaar.`,
    missionType: 'foto',
    lat: 52.0657,
    lng: 5.2033,
    unlockRadius: 60,
    gmsConnection: 25,
    gmsMeaning: 15,
    gmsJoy: 25,
    gmsGrowth: 10,
    hint1: 'De 6 seconden tellen echt — tel in je hoofd mee als het helpt. Het voelt anders dan een snelle kus.',
    hint2: 'Belofte te groot? "Eén weekend weg zonder telefoon" is beter dan "alles anders doen".',
    hint3: 'De brug over de Kromme Rijn bij het Dorpsplein is een mooie plek voor de foto.',
    navigationHint:
      'Loop vanaf Oud-Amelisweerd oostwaarts terug door het groen naar Bunnik dorp, naar het Dorpsplein en de brug over de Kromme Rijn (~2,4 km, ca. 30 min).',
  },
]

async function seed() {
  const email = process.argv[2] || 'spelleider@impacttocht.nl'
  console.log('\n💞 Seeding Bunnik KoppelTocht...\n')
  console.log(`  Spelleider/eigenaar: ${email}`)

  // ─── Spelleider ophalen of aanmaken ──────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Spelleider', ${email}, 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `
  if (!spelleider) {
    console.error(`\n❌ Kon spelleider niet vinden of aanmaken voor: ${email}`)
    process.exit(1)
  }
  console.log(`  ✓ Spelleider id: ${spelleider.id}`)

  // ─── Tour aanmaken ───────────────────────────────────────────────────────────
  const storyFrame = {
    introText:
      'Welkom bij jullie KoppelTocht door de Kromme Rijnstreek — een romantische wandeling vanuit Bunnik voor twee. Zes stops, zes missies, langs de plekken waar de streek op zijn mooist is: Rhijnauwen, de Kromme Rijn, de boomgaard en de eeuwenoude zichtlijn naar de Domtoren. Laat je telefoon zakken en elkaar zien.',
    finaleReveal:
      'Gefeliciteerd. Jullie hebben de loop gelopen — van vertrekpunt tot belofte. Dit is jullie KoppelTocht-manifest. Bewaar de foto, en de belofte.',
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
      'Bunnik — KoppelTocht',
      'Een romantische wandeling vanuit Bunnik voor twee, door de Kromme Rijnstreek. Start bij Station Bunnik. Zes checkpoints langs Rhijnauwen (lindelaan), de Kromme Rijn (jaagpad), De Veldkeuken (boomgaard) en Oud-Amelisweerd (Domtoren-zichtlijn). Missies geworteld in relatiepsychologie (Gottman): Love Map-update, mindful walk, bewondering benoemen en een 6-secondenkus als belofte. ~2 uur, ~5 km wandelen.',
      'familietocht',
      ${spelleider.id},
      true,
      120,
      6,
      0,
      'flat',
      ${JSON.stringify(storyFrame)},
      ${JSON.stringify({
        targetGroup: 'koppel, romantisch, wandelen',
        teamSize: 2,
        themes: ['verbinding', 'betekenis', 'vreugde', 'groei'],
        assistantPersona: 'Buddy',
        routeType: 'wandelen',
        startPoint: 'Station Bunnik',
        generatedAt: new Date().toISOString(),
      })}
    ) RETURNING id
  `
  console.log(`  ✓ Tour aangemaakt: id ${tour.id}`)

  // ─── Checkpoints aanmaken ────────────────────────────────────────────────────
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
        navigation_hint,
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
        ${cp.navigationHint},
        null,
        0,
        false
      )
    `
    console.log(`  ✓ CP${cp.orderIndex + 1}: ${cp.name}`)
  }

  // ─── Game sessie aanmaken ────────────────────────────────────────────────────
  const joinCode = 'BUNNIK'

  await sql`DELETE FROM game_sessions WHERE join_code = ${joinCode}`

  const [session] = await sql`
    INSERT INTO game_sessions (
      tour_id,
      spelleider_id,
      status,
      join_code,
      variant,
      is_test_mode,
      custom_session_name,
      welcome_message,
      source
    ) VALUES (
      ${tour.id},
      ${spelleider.id},
      'active',
      ${joinCode},
      'familietocht',
      true,
      'Bunnik KoppelTocht',
      'Welkom bij jullie KoppelTocht door de Kromme Rijnstreek! Zes stops, zes missies. Start bij Station Bunnik en loop westwaarts het landgoed Rhijnauwen in. Telefoon in de zak zodra jullie elkaar zien. 💞',
      'direct'
    ) RETURNING id
  `
  console.log(`  ✓ Sessie aangemaakt: id ${session.id} | code: ${joinCode}`)

  // ─── Team aanmaken ──────────────────────────────────────────────────────────
  const teamToken = crypto.randomBytes(16).toString('hex')

  const [team] = await sql`
    INSERT INTO teams (
      game_session_id,
      name,
      team_token,
      is_active
    ) VALUES (
      ${session.id},
      'Ons Duo',
      ${teamToken},
      true
    ) RETURNING id
  `
  console.log(`  ✓ Team aangemaakt: "Ons Duo" | id: ${team.id}`)

  // ─── Resultaat ───────────────────────────────────────────────────────────────
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║            ✅ Bunnik KoppelTocht klaar!                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  OPSTARTEN — open deze URL op jullie telefoon:                ║
║                                                               ║
║  ${(baseUrl + '/join?code=' + joinCode).padEnd(61)}║
║                                                               ║
║  OF ga naar /join en voer code in: ${joinCode.padEnd(27)}║
║                                                               ║
║  Team naam: Ons Duo                                           ║
║  Team token (bewaar): ${teamToken.substring(0, 32)}║
║                                                               ║
║  ROUTE (te voet, ~5 km, ca. 2 uur incl. missies):            ║
║  Start  Station Bunnik                52.0632, 5.1958  ~0 min ║
║  CP1    Station Bunnik (Love Map)     52.0632, 5.1958  ~2 min ║
║  CP2    Theehuis Rhijnauwen (Linde)   52.0699, 5.1779 ~20 min ║
║  CP3    Kromme Rijn jaagpad (Water)   52.0679, 5.1779  ~5 min ║
║  CP4    De Veldkeuken (Boomgaard)     52.0675, 5.1702 ~10 min ║
║  CP5    Oud-Amelisweerd (Zichtlijn)   52.0687, 5.1679  ~5 min ║
║  CP6    Bunnik Dorpsplein (Finale)    52.0657, 5.2033 ~30 min ║
║                                                               ║
║  GROUNDING:                                                   ║
║  • Toerisme-beleid Kromme Rijnstreek → echte locaties         ║
║  • Relatieherstel-rapport → Gottman-missies                   ║
║  • Ankers: Linde (liefde), Water (communicatie),               ║
║           Boomgaard (oogst), Zichtlijn (bewondering)          ║
║                                                               ║
║  TEST MODE aan — GPS-check soepeler (extra marge)             ║
║  Admin panel: /spelleider/sessies/${session.id.substring(0, 27)}║
╚═══════════════════════════════════════════════════════════════╝
`)
}

seed().catch((e) => {
  console.error('❌ Seed fout:', e)
  process.exit(1)
})
