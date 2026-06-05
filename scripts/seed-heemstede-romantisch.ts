/**
 * Seed: Heemstede — Romantische GPS-Tocht door Groenendaal & Binnenweg 💕
 *
 * Gebruik:
 *   bun scripts/seed-heemstede-romantisch.ts [jouw-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-heemstede-romantisch.ts v.munster@weareimpact.nl
 *
 * Wat dit maakt:
 *   - Tour "Heemstede — Romantische Wandeling Groenendaal" (6 checkpoints, ~3 km)
 *   - Game sessie in TEST MODE (GPS-check soepeler)
 *   - Team "Wij Twee" met join token
 *   - NOT published (alleen zichtbaar via directe link / admin)
 *
 * Route: Wandelbos Groenendaal (4 checkpoints) → Binnenweg Heemstede (lunch)
 *        Ca. 2,5 uur inclusief opdrachten. Wandelen ~3 km.
 *
 * GPS-coördinaten zijn ±20m nauwkeurig — fine-tune via admin-panel indien nodig.
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const checkpoints = [
  {
    orderIndex: 0,
    name: 'CP1 — De Start (Hoofdingang Groenendaal)',
    type: 'kennismaking',
    missionTitle: '🌲 De Stiltewandeling',
    missionDescription: `Welkom in Wandelbos Groenendaal.

De eerste opdracht begint nu — en hij is simpel maar niet makkelijk.

Loop de komende 10 minuten in volledige stilte naar het volgende checkpoint.
Geen praten, geen telefoon (behalve navigatie), alleen lopen.

Focus op elkaars aanwezigheid. De geluiden van het bos. De lucht. Het pad.

Na aankomst bij het volgende checkpoint mag de stilte verbroken worden.

Typ als antwoord: één zin over wat je opviel tijdens de stiltewandeling.`,
    missionType: 'opdracht',
    lat: 52.34215,
    lng: 4.61942,
    unlockRadius: 40,
    gmsConnection: 20,
    gmsMeaning: 15,
    gmsJoy: 10,
    gmsGrowth: 10,
    hint1: 'Moeilijk om stil te zijn? Dat klopt. Het is ook de bedoeling. Adem in, adem uit.',
    hint2: 'Geen haast. Het pad gaat richting de molen. Neem rustig de tijd.',
    hint3: 'Stille wandeling = telefoon op zak. Alleen de navigatie-app mag open blijven.',
  },
  {
    orderIndex: 1,
    name: 'CP2 — De Historische Molen (Groenendaalse Molen)',
    type: 'reflectie',
    missionTitle: '💬 Eén Ding Waar Je Dankbaar Voor Bent',
    missionDescription: `Jullie staan bij de Groenendaalse Molen. De stilte is voorbij.

Nu mag je weer praten — maar begin met dit:

Vertel de ander één ding waar je deze week heel erg dankbaar voor was.
Niet vaag. Iets specifieks. Iets wat de ander deed of zei, of gewoon hoe hij/zij er was.

Luister zonder te reageren totdat de ander klaar is.
Dan wissel je om.

Schrijf daarna allebei het dankbare moment van de ander op — in je eigen woorden.
Typ jouw versie in als antwoord.`,
    missionType: 'opdracht',
    lat: 52.34055,
    lng: 4.61521,
    unlockRadius: 50,
    gmsConnection: 25,
    gmsMeaning: 20,
    gmsJoy: 10,
    gmsGrowth: 5,
    hint1: 'Moeilijk iets te benoemen? Denk aan kleine momenten: een berichtje, een kopje koffie, een blik.',
    hint2: 'Luister écht — niet nadenken over wat jij straks gaat zeggen terwijl de ander praat.',
    hint3: 'Een eerlijk antwoord is beter dan een mooi antwoord. De ander weet toch wel wie je bent.',
  },
  {
    orderIndex: 2,
    name: 'CP3 — Het Romantische Bruggetje (vijver)',
    type: 'actie',
    missionTitle: '📸 De Tijdreisfoto',
    missionDescription: `Dit bruggetje over de vijver is jullie locatie voor de perfecte herinnering.

De opdracht: maak een romantische selfie — maar niet zomaar eentje.

Probeer een pose na te bootsen van een foto die jullie heel vroeg in jullie relatie hebben gemaakt.
Denk aan: dezelfde houding, dezelfde gezichtsuitdrukking, dezelfde nabijheid.

Maak de foto. Upload hem hier.

En vertel daarna — in één zin — wat er in die vroege foto anders was dan nu.
Niet slechter of beter. Gewoon anders.`,
    missionType: 'foto',
    lat: 52.33890,
    lng: 4.61785,
    unlockRadius: 45,
    gmsConnection: 20,
    gmsMeaning: 15,
    gmsJoy: 25,
    gmsGrowth: 5,
    hint1: 'Geen vroege foto in je hoofd? Kies een willekeurige pose die goed voelt en geef hem een naam.',
    hint2: 'Bruggetje als achtergrond werkt het beste — ga aan de zijkant staan met het water zichtbaar.',
    hint3: 'Het gaat niet om een perfecte foto. Het gaat om het moment van proberen.',
  },
  {
    orderIndex: 3,
    name: 'CP4 — Het Uitzichtpunt (Belvedère)',
    type: 'reflectie',
    missionTitle: '🔭 Eerste Indruk & Wat Er Sindsdien Veranderde',
    missionDescription: `Jullie staan op de uitkijkheuvel van Groenendaal. Neem een moment rust — ga zitten als er een bankje is.

De opdracht: vertel elkaar wat je allereerste indruk van de ander was.
Niet de indruk na een week of een maand. De allereerste. Die dag, dat moment.

Dan: wat is er sindsdien positief veranderd? Eén ding. Concreet.

Luister totdat de ander klaar is, dan wissel je.

Schrijf daarna op: de eerste indruk die de ander van JOU had (zoals je hem/haar net hoorde) — in je eigen woorden.
Typ dat in als antwoord.`,
    missionType: 'opdracht',
    lat: 52.34310,
    lng: 4.61390,
    unlockRadius: 50,
    gmsConnection: 20,
    gmsMeaning: 25,
    gmsJoy: 10,
    gmsGrowth: 10,
    hint1: 'Eerste indruk: denk aan vóór jullie echt contact hadden. Wat zag je, wat voelde je?',
    hint2: 'Positieve verandering hoeft geen dramatisch verhaal te zijn. "Je bent rustiger geworden" telt ook.',
    hint3: 'Mag grappig zijn. Eerste indrukken zijn zelden wat ze lijken.',
  },
  {
    orderIndex: 4,
    name: 'CP5 — Wissel naar de Binnenweg',
    type: 'samenwerking',
    missionTitle: '🚶 Van Bos naar Stad',
    missionDescription: `Jullie verlaten het bos en lopen richting de Binnenweg.

Tijdens deze wandeling: geen telefoon, geen navigatie-updates nodig — de weg is rechtdoor.

Opdracht: bedenk samen één ding dat jullie dit jaar nog willen doen.
Niet "misschien ooit". Iets concreets. Een datum mag, een plan hoeft niet.

Spreek het hardop uit aan elkaar. Één ding. Samen.

Typ het in als antwoord — de belofte van vandaag.`,
    missionType: 'opdracht',
    lat: 52.35198,
    lng: 4.62255,
    unlockRadius: 60,
    gmsConnection: 15,
    gmsMeaning: 20,
    gmsJoy: 15,
    gmsGrowth: 15,
    hint1: 'Te groot denken? Start met: "Wat willen we doen vóór het einde van de zomer?"',
    hint2: 'Al iets in je hoofd? Zeg het gewoon. Je hoeft het niet eerst perfect te formuleren.',
    hint3: 'Hardop zeggen aan de ander is de missie. Niet alleen typen.',
  },
  {
    orderIndex: 5,
    name: 'CP6 — Lunch & Finish (Binnenweg 124)',
    type: 'feest',
    missionTitle: '🍽️ Het Complimenten-Menu',
    missionDescription: `Jullie zijn er. Lunch verdiend.

Terwijl jullie op het eten wachten: open de notities op je telefoon.

Schrijf allebei — voor jezelf, zonder overleg — drie specifieke dingen op die je bewondert in hoe de ander de afgelopen jaren is gegroeid.

Geen vaagheden. Geen "je bent lief." Iets wat je echt hebt gezien.

Wacht tot het eten op tafel staat. Dan wissel je de telefoons en lees je elkaars woorden.

Typ jouw drie dingen in als antwoord — en geniet van de lunch.`,
    missionType: 'opdracht',
    lat: 52.35242,
    lng: 4.62211,
    unlockRadius: 60,
    gmsConnection: 20,
    gmsMeaning: 25,
    gmsJoy: 20,
    gmsGrowth: 20,
    hint1: 'Groei kan klein zijn: hoe iemand omgaat met stress, hoe ze een relatie onderhouden, hoe ze werken.',
    hint2: 'Drie dingen — geen twee, geen vijf. Kies de drie die er voor jou echt toe doen.',
    hint3: 'Het eten mag niet op tafel staan vóórdat je de telefoons wisselt. Dat is de regel.',
  },
]

async function seed() {
  const email = process.argv[2] || 'v.munster@weareimpact.nl'
  console.log('\n💕 Seeding Heemstede — Romantische GPS-Tocht...\n')
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

  // ─── Tour aanmaken (is_published = false → niet zichtbaar op home) ───────────
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
      'Heemstede — Romantische Wandeling Groenendaal',
      'Een romantische wandeling door Wandelbos Groenendaal met afsluiting op de Binnenweg. Zes checkpoints met opdrachten die je dichter bij elkaar brengen: stilte, dankbaarheid, een tijdreisfoto, eerste indrukken, een belofte én het complimenten-menu tijdens de lunch. ~3 km, ~2,5 uur.',
      'familietocht',
      ${spelleider.id},
      false,
      150,
      2,
      0,
      'flat',
      ${JSON.stringify({
        targetGroup: 'koppel, romantisch, wandelen',
        teamSize: 2,
        themes: ['verbinding', 'betekenis', 'vreugde', 'groei'],
        assistantPersona: 'Buddy',
        routeType: 'wandelen',
        startPoint: 'Hoofdingang Wandelbos Groenendaal, Heemstede',
        generatedAt: new Date().toISOString(),
      })}
    ) RETURNING id
  `
  console.log(`  ✓ Tour aangemaakt: id ${tour.id} (niet gepubliceerd)`)

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

  // ─── Game sessie aanmaken (test mode) ─────────────────────────────────────────
  const joinCode = 'GROEN'

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
      'Romantische Dag Heemstede',
      'Welkom bij jullie romantische wandeling door Groenendaal! Zes stops, zes opdrachten. Zet je telefoon op stil (behalve de navigatie), neem elkaars hand vast en begin bij de hoofdingang.',
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
      'Wij Twee',
      ${teamToken},
      true
    ) RETURNING id
  `
  console.log(`  ✓ Team aangemaakt: "Wij Twee" | id: ${team.id}`)

  // ─── Resultaat ────────────────────────────────────────────────────────────────
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║      ✅ Heemstede RomanticTocht klaar!                        ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  OPSTARTEN — open deze URL op jullie telefoon:                ║
║                                                               ║
║  ${(baseUrl + '/join?code=' + joinCode).padEnd(61)}║
║                                                               ║
║  OF ga naar /join en voer code in: ${joinCode.padEnd(27)}║
║                                                               ║
║  Team naam: Wij Twee                                          ║
║  Team token (bewaar): ${teamToken.substring(0, 32)}║
║                                                               ║
║  ROUTE (wandelen, ~3 km):                                     ║
║  CP1  Hoofdingang Groenendaal  52.34215, 4.61942  start       ║
║  CP2  Groenendaalse Molen      52.34055, 4.61521  ~15 min     ║
║  CP3  Bruggetje over vijver    52.33890, 4.61785  ~20 min     ║
║  CP4  Belvedère uitzichtpunt   52.34310, 4.61390  ~25 min     ║
║  CP5  Wissel naar Binnenweg    52.35198, 4.62255  ~20 min     ║
║  CP6  Binnenweg 124 (lunch)    52.35242, 4.62211  ~5 min      ║
║                                                               ║
║  PARKEREN: Groenendaal bospark, Heemstede                     ║
║  LUNCH:    Cafetaria Petit Restaurant Family, Binnenweg 124   ║
║                                                               ║
║  TEST MODE aan — GPS-check is soepeler (20m extra marge)      ║
║  Niet gepubliceerd — alleen zichtbaar via join-code           ║
║  Admin panel: /spelleider/sessies/${session.id.substring(0, 27)}║
╚═══════════════════════════════════════════════════════════════╝
`)
}

seed().catch((e) => {
  console.error('❌ Seed fout:', e)
  process.exit(1)
})
