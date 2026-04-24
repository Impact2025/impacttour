/**
 * Seed: Amsterdam KoppelTocht — Liefde & Impact 💕
 *
 * Gebruik:
 *   bun scripts/seed-amsterdam-koppeltocht.ts [jouw-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-amsterdam-koppeltocht.ts chat@weareimpact.nl
 *
 * Wat dit maakt:
 *   - Tour "Amsterdam — KoppelTocht" (5 checkpoints, ~8 km op de fiets)
 *   - Game sessie in TEST MODE
 *   - Team "Ons Duo" met join token
 *
 * Route: Start OV-fiets Centraal IJzijde West → Brouwersgracht → Begijnhof
 *        → Bloemenmarkt → Magere Brug → Vondelpark (rozentuinen)
 *        Ca. 2,5 uur inclusief missies. Op de fiets ~50 min rijden totaal.
 *
 * GPS-coördinaten zijn ±20m nauwkeurig — controleer via Google Maps
 * en fine-tune via het admin-panel als nodig.
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// ─── Route: Amsterdam KoppelTocht (start OV-fiets Centraal IJzijde West) ──────
// Start: 52.3792, 4.8982 — OV-fiets station, westzijde Amsterdam Centraal
// Finish: Vondelpark rozentuinen, 52.3596, 4.8710

const checkpoints = [
  {
    orderIndex: 0,
    name: 'CP1 — Brouwersgracht',
    type: 'kennismaking',
    missionTitle: '💬 De Vraag Die Je Nooit Stelde',
    missionDescription: `Je staat op de mooiste gracht van Amsterdam.
Huis aan huis, water dat spiegelt, een stiltemoment midden in de stad.

Hier is de afspraak: jullie stellen elkaar elk één vraag.
Geen kleine vraag. Eén vraag die je nog nooit hebt durven stellen.

Niet "wat wil jij eten vanavond."
Iets echts. Iets waar je het antwoord eigenlijk al een tijdje wil weten.

Neem even de tijd om te bedenken. Schrijf hem op als je wil — maar stel hem hardop.
Luister écht naar het antwoord. Geen telefoon tussendoor.

Typ de twee vragen in als antwoord (je hoeft het antwoord zelf niet te delen — alleen de vragen).`,
    missionType: 'opdracht',
    lat: 52.3770,
    lng: 4.8870,
    unlockRadius: 50,
    gmsConnection: 25,
    gmsMeaning: 15,
    gmsJoy: 5,
    gmsGrowth: 10,
    hint1: 'Geen goede vraag in je hoofd? Begin met: "Wat is iets dat jij wil dat ik vaker doe?"',
    hint2: 'Of: "Welk moment van ons samen denk jij het vaakst terug aan?"',
    hint3: 'Een stille vraag telt niet. Hardop is het punt — ook als het een beetje spannend voelt.',
  },
  {
    orderIndex: 1,
    name: 'CP2 — Begijnhof',
    type: 'reflectie',
    missionTitle: '✍️ Wat Ik In Jou Zie',
    missionDescription: `Je bent nu in het Begijnhof — een verborgen hofje uit de 14e eeuw.
Generaties vrouwen woonden hier samen, zorgden voor elkaar, bouwden een gemeenschap in stilte.

Hier past maar één opdracht: schrijven.

Elk voor jezelf, zonder overleg, schrijf je drie dingen op die je oprecht waardeert in de ander.
Mogen grote dingen zijn. Mogen ook kleine dingen zijn — hoe iemand koffie zet, hoe ze naar je luistert, hoe hij lacht als hij niet weet dat je kijkt.

Schrijf ze op. Wissel dan de briefjes (of telefoons) en lees elkaars woorden.
Geen commentaar. Geen "ach, dat stel je niks voor." Alleen lezen.

Typ de drie dingen die jij hebt opgeschreven in als antwoord.`,
    missionType: 'opdracht',
    lat: 52.3700,
    lng: 4.8900,
    unlockRadius: 40,
    gmsConnection: 20,
    gmsMeaning: 25,
    gmsJoy: 5,
    gmsGrowth: 5,
    hint1: 'Moeilijk om te beginnen? Start met: "Ik waardeer dat jij altijd..."',
    hint2: 'Klein is groot. "Hoe je me belt als ik een slechte dag heb" is beter dan "je bent lief."',
    hint3: 'Geen haast. Dit hofje is 700 jaar oud. Jullie mogen hier even stil staan.',
  },
  {
    orderIndex: 2,
    name: 'CP3 — Bloemenmarkt',
    type: 'samenwerking',
    missionTitle: '🌸 Eén Bloem Voor Jullie',
    missionDescription: `De Bloemenmarkt — honderden soorten, kleuren, geuren.
En ergens tussen al die bloemen zit er één die van jullie is.

De opdracht: koop samen één bloem (of boeket) die jullie relatie beschrijft.
Niet de mooiste. Niet de duurste. De juiste.

Bespreek samen welke het wordt — en waarom. De redenering is de missie.

Maak daarna een foto met de bloem. De bloem gaat mee voor de rest van de tocht.

Beschrijf in je antwoord:
1. Welke bloem jullie kozen
2. Waarom precies deze`,
    missionType: 'foto',
    lat: 52.3680,
    lng: 4.8945,
    unlockRadius: 50,
    gmsConnection: 15,
    gmsMeaning: 15,
    gmsJoy: 25,
    gmsGrowth: 5,
    hint1: 'Twijfelen jullie tussen twee? Kies allebei een favoriet — neem dan de bloem die de ander koos. Voor de ander.',
    hint2: 'Geen enkel antwoord is fout. Een cactus mag ook. Maar leg dan wel uit waarom.',
    hint3: 'De foto mag creatief: bloem op de brug, bloem in het water, bloem voor een rij tulpen. Jullie keuze.',
  },
  {
    orderIndex: 3,
    name: 'CP4 — Magere Brug',
    type: 'actie',
    missionTitle: '📸 Eén Herinnering Die Blijft',
    missionDescription: `De Magere Brug. Het bekendste bruggetje van Amsterdam.
\'s Avonds verlicht, overdag omgeven door Amstelwater aan beide kanten.

Maak hier een selfie — maar niet zomaar een selfie.
Dit is jullie officiële moment van vandaag. Neem de tijd. Probeer meerdere hoeken.

Dan: kijk elkaar aan en vertel elk één herinnering.
Niet van vandaag — maar van iets eerder. Een moment samen dat je nooit vergeet.
Het hoeft niet spectaculair te zijn. Het moet waar zijn.

Luister naar de herinnering van de ander zonder hem te onderbreken.

Upload de selfie en schrijf in je antwoord de herinnering die jij deelde — in één zin.`,
    missionType: 'foto',
    lat: 52.3637,
    lng: 4.9009,
    unlockRadius: 50,
    gmsConnection: 25,
    gmsMeaning: 20,
    gmsJoy: 15,
    gmsGrowth: 5,
    hint1: 'Goede selfie-plek: midden op de brug, draai je met je rug naar het water. Brug als achtergrond.',
    hint2: 'Herinnering ophalen: denk aan een vakantie, een avond thuis, een moment dat je verraste. Wat schiet als eerste te binnen?',
    hint3: 'Eén zin is genoeg. "Die avond in Lissabon toen we verdwaald waren en het niet erg vonden" is perfect.',
  },
  {
    orderIndex: 4,
    name: 'CP5 — Vondelpark Rozentuinen',
    type: 'feest',
    missionTitle: '🌹 Jullie Belofte Voor Dit Jaar',
    missionDescription: `Jullie zijn er. Vondelpark, de rozentuinen.

Ga ergens zitten. Leg de fiets neer. Zet de bloem van de Bloemenmarkt neer als jullie hem nog hebben.

Dit is het laatste checkpoint — en het belangrijkste.

Elk van jullie bedenkt één ding dat jullie dit jaar nog samen wil doen.
Niet "misschien", niet "als we tijd hebben." Iets concreets. Iets wat je echt wil.

En daarna: maak er een belofte van. Klein mag. Een datum mag. Een plan hoeft nog niet.

Zeg het hardop aan elkaar.

Typ jullie twee dingen in als antwoord. Dit is jullie KoppelTocht manifest.`,
    missionType: 'opdracht',
    lat: 52.3596,
    lng: 4.8710,
    unlockRadius: 60,
    gmsConnection: 20,
    gmsMeaning: 20,
    gmsJoy: 20,
    gmsGrowth: 20,
    hint1: 'Niet te groot denken. "Een weekend weg zonder telefoon" is beter dan "wereldreis."',
    hint2: 'Twijfel je? Denk aan iets wat je al een tijdje wil voorstellen maar steeds uitstelt.',
    hint3: 'De bloem van checkpoint 3 mag hier z\'n definitieve plek krijgen. Of je neemt hem mee naar huis.',
  },
]

async function seed() {
  const email = process.argv[2] || 'spelleider@impacttocht.nl'
  console.log('\n💕 Seeding Amsterdam KoppelTocht...\n')
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

  // ─── Tour aanmaken ────────────────────────────────────────────────────────────
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
      ai_config
    ) VALUES (
      'Amsterdam — KoppelTocht',
      'Een romantische fietstocht door Amsterdam voor twee. Start bij OV-fiets Amsterdam Centraal IJzijde West. Vijf checkpoints langs de mooiste plekken van de stad: Brouwersgracht, Begijnhof, Bloemenmarkt, Magere Brug en Vondelpark. Missies die je dichter bij elkaar brengen: durfvragen, bloemen kiezen, herinneringen ophalen en een belofte maken. ~2,5 uur, ~8 km.',
      'familietocht',
      ${spelleider.id},
      false,
      150,
      2,
      0,
      'flat',
      ${JSON.stringify({
        targetGroup: 'koppel, romantisch, fiets',
        teamSize: 2,
        themes: ['verbinding', 'betekenis', 'vreugde', 'groei'],
        assistantPersona: 'Buddy',
        routeType: 'fiets',
        startPoint: 'OV-fiets Amsterdam Centraal IJzijde West',
        generatedAt: new Date().toISOString(),
      })}
    ) RETURNING id
  `
  console.log(`  ✓ Tour aangemaakt: id ${tour.id}`)

  // ─── Checkpoints aanmaken ─────────────────────────────────────────────────────
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
        null,
        0,
        false
      )
    `
    console.log(`  ✓ CP${cp.orderIndex + 1}: ${cp.name}`)
  }

  // ─── Game sessie aanmaken ─────────────────────────────────────────────────────
  const joinCode = 'KANAAL'

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
      'Amsterdam KoppelTocht',
      'Welkom bij jullie KoppelTocht door Amsterdam! Vijf stops, vijf missies. Haal eerst de OV-fietsen op bij Centraal IJzijde West en rij richting Brouwersgracht.',
      'direct'
    ) RETURNING id
  `
  console.log(`  ✓ Sessie aangemaakt: id ${session.id} | code: ${joinCode}`)

  // ─── Team aanmaken ─────────────────────────────────────────────────────────────
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

  // ─── Resultaat ────────────────────────────────────────────────────────────────
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         ✅ Amsterdam KoppelTocht klaar!                       ║
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
║  ROUTE (op de fiets, ~50 min rijden totaal):                  ║
║  Start  OV-fiets Centraal IJzijde West                        ║
║  CP1    Brouwersgracht (Jordaan)     52.3770, 4.8870  ~10 min ║
║  CP2    Begijnhof                    52.3700, 4.8900  ~10 min ║
║  CP3    Bloemenmarkt (Singel)        52.3680, 4.8945  ~5 min  ║
║  CP4    Magere Brug (Amstel)         52.3637, 4.9009  ~10 min ║
║  CP5    Vondelpark (rozentuinen)     52.3596, 4.8710  ~15 min ║
║                                                               ║
║  TIP: Bloemenmarkt open ma-za 09:00-17:30, zo 11:00-17:30     ║
║  TIP: Begijnhof sluit om 17:00 (check openingstijden)         ║
║                                                               ║
║  TEST MODE aan — GPS-check is soepeler (20m extra marge)      ║
║  Admin panel: /spelleider/sessies/${session.id.substring(0, 27)}║
╚═══════════════════════════════════════════════════════════════╝
`)
}

seed().catch((e) => {
  console.error('❌ Seed fout:', e)
  process.exit(1)
})
