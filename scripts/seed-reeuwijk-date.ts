/**
 * Seed: Reeuwijkse Plassen — RomanticTocht voor koppel 💕
 *
 * Gebruik:
 *   bun scripts/seed-reeuwijk-date.ts [jouw-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-reeuwijk-date.ts vincent@weareimpact.nl
 *
 * Wat dit maakt:
 *   - Tour "Reeuwijkse Plassen — Wandeling voor Twee" (5 checkpoints, ~3.5 km)
 *   - Game sessie in TEST MODE (GPS-check soepeler, handig voor testen)
 *   - Team "Romantisch Duo" met join token
 *
 * Route: Loopt vanuit parkeerplaats Reeuwijkse Hout langs uitkijktoren,
 *        surfplas, smal pad en terug. Geschikt voor hond. Ca. 90 min.
 *
 * GPS-coördinaten zijn ±30m nauwkeurig — controleer via Google Maps
 * en fine-tune via het admin-panel als nodig.
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// ─── Route: Reeuwijkse Plassen (parkeerplaats Reeuwijkse Hout als start) ──────
// Start GPS: N52.05830 E4.73985 (Reeuwijksehoutwal 4, 2811 NW Reeuwijk)
// Loop ~3.5 km via uitkijktoren, surfplas en smal pad terug.

const checkpoints = [
  {
    orderIndex: 0,
    name: 'CP1 — De Opening',
    type: 'kennismaking',
    missionTitle: '🎬 Jullie Film Begint Hier',
    missionDescription: `Jullie dag is een film. Geef hem een titel en een genre
(romantische komedie, avonturenfilm, indie drama, documentaire...).

Maak een selfie als filmposter bij jullie startpunt — het uitzicht op de plassen is jullie openingsscene.

Beschrijf in je antwoord:
1. De filmtitel
2. Het genre
3. Jullie rolverdeling (wie speelt welke rol?)

De hond mag ook een rol krijgen.`,
    missionType: 'foto',
    // Parkeerplaats Reeuwijkse Hout
    lat: 52.0583,
    lng: 4.7399,
    unlockRadius: 40,
    gmsConnection: 15,
    gmsMeaning: 5,
    gmsJoy: 25,
    gmsGrowth: 5,
    hint1: 'Ga staan met de plassen op de achtergrond. Camera laag, kijk de verte in. Dramatischer dan je denkt.',
    hint2: 'Twijfel je over het genre? Denk aan de laatste film die jullie samen zagen — maar dan hier, buiten, met een hond.',
    hint3: 'Geen perfecte selfie nodig — de meest authentieke foto wint altijd.',
  },
  {
    orderIndex: 1,
    name: 'CP2 — De Uitkijk',
    type: 'samenwerking',
    missionTitle: '🔭 Jullie Geheime Plek in de Verte',
    missionDescription: `Jullie staan nu bij de uitkijktoren — klim naar boven als die open is.

Elk van jullie kiest onafhankelijk van de ander één ding dat jullie van bovenaf zien:
een eilandje, een steiger, een meeuw die stilstaat, een veld.

Wijs tegelijk aan. Als jullie hetzelfde kiezen: 10 bonuspunten (op eer-systeem).

Geef de plek die jullie samen kozen (of die van degene die gelijk had) een naam.
Schrijf op: de naam én wat jullie daar ooit zouden doen samen.`,
    missionType: 'opdracht',
    // Uitkijktoren Reeuwijkse Hout (~400m naar het zuiden/westen)
    lat: 52.0557,
    lng: 4.7370,
    unlockRadius: 40,
    gmsConnection: 20,
    gmsMeaning: 15,
    gmsJoy: 15,
    gmsGrowth: 5,
    hint1: 'Niet nadenken — wijs meteen aan wat je oog trekt. Het eerste wat je ziet, dat is het.',
    hint2: 'De naam mag in een taal die jullie zelf bedenken. Hoeft geen echt woord te zijn.',
    hint3: 'Wat jullie daar ooit zouden doen: hoe concreter hoe beter. "Picknicken" is oké, maar "croissants eten en niks zeggen" is beter.',
  },
  {
    orderIndex: 2,
    name: 'CP3 — De Stilte',
    type: 'reflectie',
    missionTitle: '🌊 Twee Minuten Niks',
    missionDescription: `Jullie staan nu langs het water bij de surfplas.

Afspraak: twee minuten volledig stil. Geen telefoon, geen praten.
Gewoon kijken. Luisteren. Voelen.

Daarna schrijft ieder voor zich op — zonder overleg — drie dingen:
- Iets wat je HOORDE
- Iets wat je ZAG
- Iets wat je VOELDE (intern, niet de wind)

Vergelijk jullie lijstjes. Wat zag de ander wat jij helemaal miste?

Schrijf het verschil op als je antwoord.`,
    missionType: 'opdracht',
    // Langs de surfplas / open water (~500m verder langs het pad)
    lat: 52.0541,
    lng: 4.7418,
    unlockRadius: 40,
    gmsConnection: 15,
    gmsMeaning: 20,
    gmsJoy: 10,
    gmsGrowth: 15,
    hint1: 'Twee minuten voelt lang. Het is ook lang. Dat is precies de bedoeling.',
    hint2: 'Geen headstart geven aan de ander — tegelijk beginnen, tegelijk schrijven.',
    hint3: 'Het verschil in jullie lijstjes zegt iets. Niet over wie gelijk heeft, maar over hoe jullie kijken.',
  },
  {
    orderIndex: 3,
    name: 'CP4 — De Belofte',
    type: 'actie',
    missionTitle: '🌿 Eén Belofte, Hardop',
    missionDescription: `Dit smalle pad symboliseert een keuze: je gaat ergens heen, samen.

Maak hier een foto — het pad voor jullie, of achter jullie, maakt niet uit.

Schrijf daarna elk voor jezelf één belofte op voor het komende jaar.
Niet voor jezelf — voor de ander. Iets wat je gaat doen of laten.

Lees ze aan elkaar voor. Hardop.

Typ de twee beloftes in als antwoord (geen schaamte — de app bewaard dit alleen voor jullie).`,
    missionType: 'foto',
    // Smal pad / bruggetje oostkant route
    lat: 52.0562,
    lng: 4.7464,
    unlockRadius: 40,
    gmsConnection: 25,
    gmsMeaning: 20,
    gmsJoy: 5,
    gmsGrowth: 10,
    hint1: 'Een belofte hoeft niet groot te zijn. "Ik ga vaker mijn telefoon wegleggen als jij praat" telt ook.',
    hint2: 'Hoe specifieker de belofte, hoe echte hij voelt. Vermijd "ik ga meer..." zonder dat erbij te zeggen.',
    hint3: 'Hardop uitspreken is het punt. Fluisteren mag als niemand kijkt.',
  },
  {
    orderIndex: 4,
    name: 'CP5 — Thuiskomst',
    type: 'feest',
    missionTitle: '💛 Drie Dingen Die Je Zag Vandaag',
    missionDescription: `De tocht zit erop. Bijna.

Benoem elk drie dingen die je vandaag (opnieuw) mooi vond aan de ander.
Mogen grote of kleine dingen zijn. Mogen dingen zijn die al lang zo zijn.

Zeg ze hardop. Kijk elkaar aan. Geen telefoon tussendoor.

De hond mag applaudisseren als hij wil.

Typ ze daarna in — jullie mogen ze allebei opschrijven zodat jullie ze later terug kunnen lezen.`,
    missionType: 'opdracht',
    // Terugkeer langs het water richting parkeerplaats
    lat: 52.0597,
    lng: 4.7441,
    unlockRadius: 50,
    gmsConnection: 25,
    gmsMeaning: 15,
    gmsJoy: 20,
    gmsGrowth: 10,
    hint1: 'Niet zeggen "dat weet je toch al" — dat is precies waarom je het wél hardop zegt.',
    hint2: 'Kleine dingen tellen het meest. Hoe je koffie zet, hoe je lacht, hoe je de hond roept.',
    hint3: 'Geen haast. Dit is het laatste checkpoint. Neem de tijd.',
  },
]

async function seed() {
  const email = process.argv[2] || 'spelleider@impacttocht.nl'
  console.log('\n💕 Seeding Reeuwijkse Plassen — RomanticTocht...\n')
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
      'Reeuwijkse Plassen — Wandeling voor Twee',
      'Een romantische wandeling langs de Reeuwijkse Plassen. Vijf checkpoints met opdrachten die je samen brengen: een filmposter maken, een plek in de verte benoemen, twee minuten zwijgen, een belofte uitspreken en afsluiten met drie dingen die je mooi vindt aan de ander. Geschikt voor hond. ~3.5 km, ~90 min.',
      'familietocht',
      ${spelleider.id},
      false,
      90,
      2,
      0,
      'flat',
      ${JSON.stringify({
        targetGroup: 'koppel, persoonlijk, romantisch',
        teamSize: 2,
        themes: ['verbinding', 'reflectie', 'natuur', 'belofte'],
        assistantPersona: 'Buddy',
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

  // ─── Game sessie aanmaken (test mode, zodat GPS check soepeler is) ───────────
  const joinCode = 'LIEFDE'

  // Verwijder eventuele oude sessie met dezelfde join code
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
      'Wandeling Reeuwijk',
      'Welkom bij jullie wandeling langs de Reeuwijkse Plassen! Vijf stops, vijf opdrachten. Neem de tijd.',
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
      'Romantisch Duo',
      ${teamToken},
      true
    ) RETURNING id
  `
  console.log(`  ✓ Team aangemaakt: "Romantisch Duo" | id: ${team.id}`)

  // ─── Resultaat ────────────────────────────────────────────────────────────────
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           ✅ RomanticTocht Reeuwijk klaar!                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  MORGEN OPSTARTEN — STAP 1:                                   ║
║  Open deze URL op jullie telefoon:                            ║
║                                                               ║
║  ${(baseUrl + '/join?code=' + joinCode).padEnd(61)}║
║                                                               ║
║  OF ga naar /join en voer code in: ${joinCode.padEnd(27)}║
║                                                               ║
║  Team naam: Romantisch Duo                                    ║
║  Team token (bewaar): ${teamToken.substring(0, 32)}║
║                                                               ║
║  ROUTE (verificeer op Google Maps voor vertrek):              ║
║  CP1  Start Parkeerplaats    52.0583, 4.7399                  ║
║  CP2  Uitkijktoren           52.0557, 4.7370  (~500m)         ║
║  CP3  Langs de surfplas      52.0541, 4.7418  (~500m)         ║
║  CP4  Smal pad bruggetje     52.0562, 4.7464  (~500m)         ║
║  CP5  Terugkeer langs water  52.0597, 4.7441  (~500m)         ║
║                                                               ║
║  PARKEREN: Reeuwijksehoutwal 4, 2811 NW Reeuwijk              ║
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
