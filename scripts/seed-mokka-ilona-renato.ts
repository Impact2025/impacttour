/**
 * Seed: Mokka Nieuw Begin — Ilona & Renato
 *
 * Een persoonlijke GPS-tocht op Calle Duarte, Las Terrenas.
 * Van de oude Mocca's locatie (Plaza Sabrina) naar de nieuwe (Plaza Casa Linda).
 * 6 stops. ~3 km. ~3.5 uur inclusief lunchtijd.
 *
 * Thema's: loslaten · terugkijken met liefde · waardering voor elkaar ·
 *           doelen stellen · nieuw begin
 *
 * Gebruik:
 *   bun scripts/seed-mokka-ilona-renato.ts [email]
 *
 * Voorbeeld:
 *   bun scripts/seed-mokka-ilona-renato.ts ilona@moccasbrunchbar.com
 *
 * Wat dit aanmaakt:
 *   - Tour "Mokka Nieuw Begin — Ilona & Renato"
 *   - Game sessie in TEST MODE (join code: MOCCAS)
 *   - Team "Ilona & Renato"
 *   - Idempotent: als tour al bestaat, wordt het script overgeslagen
 *
 * GPS-NOOT: Coördinaten zijn ~50-100m nauwkeurig.
 * Verificeer Plaza Sabrina en Plaza Casa Linda op Google Maps voor vertrek
 * en pas eventueel aan via het admin panel (/admin/tochten).
 * TEST MODE is aan — GPS-check heeft een extra marge van 20m.
 *
 * ROUTE (lus, ~4 km totaal):
 *   Stop 1  Pueblo de los Pescadores — strand (opening, loslaten)
 *   Stop 2  Oude Mocca's — Plaza Sabrina, Calle Duarte (~1.4 km inland)
 *   Stop 3  Calle Duarte — de oversteek (~500 m, waardering voor elkaar)
 *   Stop 4  Lokale markt op Calle Duarte (~260 m)
 *   Stop 5  Nieuwe Mocca's — Plaza Casa Linda, Calle Duarte (~200 m)
 *   Stop 6  Playa Las Terrenas — strand (~1.5 km terug, afsluiting)
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const TOUR_NAME = 'Mokka Nieuw Begin — Ilona & Renato'
const JOIN_CODE = 'MOCCAS'

// ─── Checkpoints ──────────────────────────────────────────────────────────────
// GPS-coördinaten zijn beste schattingen op basis van kaartdata.
// Fine-tune via admin panel als nodig.

const checkpoints = [
  {
    orderIndex: 0,
    name: 'Stop 1 — Pueblo de los Pescadores: Aankomen',
    type: 'reflectie' as const,
    missionTitle: 'Wat neem je mee. Wat laat je achter.',
    missionDescription: `Jullie staan aan het water. Voordat de tocht begint, eerst dit:

Schrijf elk voor jezelf — niet voor de ander, voor jezelf — twee dingen op:

1. Iets wat je ACHTERLAAT. Iets uit de afgelopen periode dat je niet mee wil nemen naar wat er nu komt. Een gevoel, een gewoonte, een gedachte. Het hoeft niet groot te zijn.

2. Iets wat je MEE NEEMT. Een les, een kracht, iets wat jullie hebben geleerd dat jullie nu wél willen vasthouden.

Lees ze daarna aan elkaar voor. Luister zonder te reageren. Zeg daarna alleen: "Ik hoor je."

Typ jullie antwoorden in — elk één zin per punt.`,
    missionType: 'opdracht',
    // Pueblo de los Pescadores — strandpromenade Las Terrenas
    lat: 19.3232,
    lng: -69.5379,
    unlockRadius: 100,
    gmsConnection: 10,
    gmsMeaning: 20,
    gmsJoy: 5,
    gmsGrowth: 15,
    hint1: 'Ga aan het water staan. Schrijf los van elkaar — vijf minuten. Geen overleg over wat je schrijft.',
    hint2: 'Het hoeft niet perfect geformuleerd te zijn. Het gaat om het hardop maken, niet het mooie schrijven.',
    hint3: '"Ik hoor je" is genoeg. Je hoeft het niet op te lossen of te reageren. Gewoon: ik hoor je.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 1,
    name: 'Stop 2 — Oude Mocca\'s (Plaza Sabrina, Calle Duarte)',
    type: 'reflectie' as const,
    missionTitle: 'Mocca\'s 1.0 — terugkijken met liefde',
    missionDescription: `Jullie staan voor de plek waar het allemaal begon.

Kijk er goed naar. Neem even de tijd.

Schrijf elk voor jezelf drie dingen op:

1. HET MOOISTE MOMENT dat hier is gebeurd. Eén specifiek moment — niet "de sfeer" maar een dag, een gast, een avond.

2. HET MOEILIJKSTE MOMENT dat jullie hier samen doorheen zijn gekomen. Iets waar jullie trots op mogen zijn dat jullie het hebben doorstaan.

3. DE BELANGRIJKSTE LES die Mocca's 1.0 jullie heeft geleerd. Iets wat jullie alleen hier hadden kunnen leren.

Deel ze met elkaar. Neem de tijd — dit is geen race. Dit is het eerlijke terugkijken dat jullie verdienen.

Typ jullie antwoorden in — elk drie zinnen.`,
    missionType: 'opdracht',
    // Plaza Sabrina, Calle Duarte — ~1.4 km inland van Pueblo de los Pescadores
    // Verificeer op Google Maps: "Plaza Sabrina Las Terrenas"
    lat: 19.3108,
    lng: -69.5355,
    unlockRadius: 120,
    gmsConnection: 15,
    gmsMeaning: 25,
    gmsJoy: 5,
    gmsGrowth: 20,
    hint1: 'Het mooiste moment mag iets kleins zijn — een gast die terugkwam, een ochtend waarop alles klopte.',
    hint2: 'Het moeilijkste moment verdient respect. Het hoeft niet zwaar te klinken — het mag ook gewoon eerlijk zijn.',
    hint3: 'De les: probeer niet te algemeen te zijn. "Doorzetten" is prima, maar "nooit meer X doen zonder Y" is beter.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 2,
    name: 'Stop 3 — Calle Duarte: De oversteek',
    type: 'samenwerking' as const,
    missionTitle: 'Wat ik in jou zag toen het moeilijk was',
    missionDescription: `Jullie lopen de weg van oud naar nieuw. Jullie hebben deze straat al zo vaak gelopen — moe, gestrest, hoopvol, samen.

Nu: stop. Kijk naar de ander.

Elk van jullie noemt drie dingen:

"Een kwaliteit die ik in jou heb gezien tijdens de moeilijke periode, die ik daarvóór misschien niet zo had gezien."

Geen algemeenheden. Geen "je bent sterk." Maar: wat heb je de ander zien DOEN dat je raakte? Een concreet moment. Een manier van reageren. Iets wat jullie relatie heeft bewezen.

Zeg het hardop. Kijk de ander aan. Geen telefoon tussendoor.

Typ de drie dingen in die je hebt gezegd — zodat jullie ze later terug kunnen lezen.`,
    missionType: 'opdracht',
    // Calle Duarte, tussen de twee Mocca's-locaties in
    lat: 19.3100,
    lng: -69.5410,
    unlockRadius: 150,
    gmsConnection: 25,
    gmsMeaning: 15,
    gmsJoy: 10,
    gmsGrowth: 5,
    hint1: 'Geen algemeenheden — "je bent zo sterk" telt niet. Benoem een specifiek moment of gedrag.',
    hint2: 'Als je het moeilijk vindt om te beginnen: denk aan één avond of moment de afgelopen periode. Wat deed de ander toen?',
    hint3: 'Luister volledig als de ander spreekt. Wacht met jouw drie tot zij/hij klaar is.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 3,
    name: 'Stop 4 — Lokale ontmoeting: Las Terrenas kiest jullie',
    type: 'actie' as const,
    missionTitle: 'Vertel het aan iemand die het niet weet',
    missionDescription: `Jullie wonen hier. Dit is jullie gemeenschap.

Zoek een lokale persoon — een verkoper, een buur, iemand die jullie kennen maar niet goed — en vertel ze in één of twee zinnen iets over de nieuwe Mocca's. Niet de details. Gewoon: er komt iets nieuws. Iets waarvoor je blij bent.

Let op hun reactie. Soms zie je pas hoe groot iets is als je het aan een buitenstaander vertelt.

Koop daarna iets kleins bij een lokale kraam of winkel — kokosnoot, fruit, iets lokaals. Trakteer jezelf. Jullie verdienen het.

Beschrijf in de app:
- Aan wie vertelde je het?
- Wat was hun reactie?
- Wat kochten jullie?`,
    missionType: 'opdracht',
    // Calle Duarte — lokale kraam, markt of Sirena supermarkt in de buurt
    lat: 19.3098,
    lng: -69.5432,
    unlockRadius: 150,
    gmsConnection: 15,
    gmsMeaning: 10,
    gmsJoy: 20,
    gmsGrowth: 5,
    hint1: 'Het hoeft niet dramatisch te zijn — "we openen binnenkort een nieuwe plek" is genoeg.',
    hint2: 'Iemand die jullie vaag kennen is beter dan een vreemde — de reactie van een bekende raakt meer.',
    hint3: 'Geen perfecte kokosnoot nodig. Het gaat om het gebaar naar jullie zelf.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 4,
    name: 'Stop 5 — Nieuwe Mocca\'s (Plaza Casa Linda, Calle Duarte)',
    type: 'actie' as const,
    missionTitle: 'Mocca\'s 2.0 — jullie startschot',
    missionDescription: `Jullie nieuwe plek. Sta er voor.

Dit is het officiële startschot van het nieuwe hoofdstuk.

Schrijf elk drie doelen op — los van elkaar, voor jullie ze deelt:

1. ÉÉN ZAKELIJK DOEL voor Mocca's 2.0. Concreet en meetbaar. Geen "het beter doen" — maar: wat wil je over 1 jaar kunnen zeggen dat jullie hebben bereikt?

2. ÉÉN DOEL VOOR JULLIE SAMENWERKING als ondernemers. Iets in hoe jullie samenwerken dat jullie anders wil aanpakken of vasthouden.

3. ÉÉN PERSOONLIJK DOEL voor jezelf in dit nieuwe hoofdstuk. Niet voor de zaak — voor jou.

Lees ze voor aan elkaar. Hardop, bij jullie nieuwe plek.

Maak daarna een foto samen voor de ingang. Dit is jullie "dag 1"-foto.`,
    missionType: 'foto',
    // Plaza Casa Linda, Calle Duarte — busstation-gebied Las Terrenas centrum
    // Verificeer op Google Maps: "Plaza Casa Linda Las Terrenas"
    lat: 19.3096,
    lng: -69.5441,
    unlockRadius: 120,
    gmsConnection: 15,
    gmsMeaning: 20,
    gmsJoy: 10,
    gmsGrowth: 25,
    hint1: 'Zakelijk doel: denk aan een getal, een mijlpaal, of een kwaliteit die jullie willen bereiken — niet een gevoel.',
    hint2: 'Samenwerkingsdoel: denk aan iets wat de afgelopen periode stroef ging. Hoe zou jullie ideale samenwerking eruitzien?',
    hint3: 'Persoonlijk doel: mag klein zijn. "Iedere week één moment voor mezelf" is ook een doel.',
    bonusPhotoPoints: 25,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 5,
    name: 'Stop 6 — Playa Las Ballenas: De gedeelde droom',
    type: 'feest' as const,
    missionTitle: 'Als Mocca\'s 2.0 over 5 jaar bestaat...',
    missionDescription: `De dag is bijna voorbij. Jullie hebben teruggekeken, doorgesproken, iets nieuws gezet.

Nu vooruit kijken. Niet naar volgend kwartaal — naar over 5 jaar.

Schrijf elk deze zin af — los van elkaar:

"Als Mocca's 2.0 over 5 jaar bestaat, dan..."

Geen bescheidenheid. Schrijf de echte droom op. Wat zien jullie? Wie zijn jullie? Hoe voelt het?

Lees ze voor aan elkaar bij het water.

Vertel daarna — zonder na te denken, gewoon het eerste wat in je opkomt — één ding wat je VANDAAG al hebt gezien in de ander dat bewijst dat die droom echt kan worden.`,
    missionType: 'opdracht',
    // Playa Las Terrenas — strand westelijk van Pueblo de los Pescadores
    lat: 19.3235,
    lng: -69.5452,
    unlockRadius: 150,
    gmsConnection: 20,
    gmsMeaning: 20,
    gmsJoy: 15,
    gmsGrowth: 15,
    hint1: 'Schrijf écht de droom — niet de veilige versie. De veilige versie is niet waarom jullie hierheen zijn gekomen.',
    hint2: 'Over 5 jaar: wie zijn jullie klanten? Hoe ziet een gemiddelde ochtend eruit? Hoe voelt de plek?',
    hint3: 'Het bewijs van vandaag mag heel klein zijn — een woord, een manier waarop de ander reageerde. Vertel het.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
]

const AI_EVALUATION_PROMPT =
  'Ilona en Renato hebben vandaag hun eigen verhaal bewandeld — van loslaten bij het water, ' +
  'terugkijken bij hun oude plek, naar elkaars kwaliteiten onder ogen zien op Calle Duarte, ' +
  'tot het uitspreken van nieuwe doelen bij hun nieuwe locatie. ' +
  'Beschrijf in 3 zinnen wat deze tocht uniek maakte voor hen als mensen en als ondernemers — ' +
  'en benoem één concrete kracht die ze vandaag hebben laten zien die hen klaarstoomt voor Mocca\'s 2.0.'

async function seed() {
  const email = process.argv[2] || 'spelleider@impacttocht.nl'

  console.log('\nMokka Nieuw Begin — seeding voor Ilona & Renato\n')
  console.log(`  Eigenaar account: ${email}`)

  // ─── Idempotentie ────────────────────────────────────────────────────────────
  const existing = await sql`SELECT id FROM tours WHERE name = ${TOUR_NAME} LIMIT 1`
  if (existing.length > 0) {
    console.warn(`\n  Tocht "${TOUR_NAME}" bestaat al (id: ${existing[0].id}).`)
    console.warn('  Seed overgeslagen. Verwijder de tour via admin panel om opnieuw te seeden.\n')
    process.exit(0)
  }

  // ─── Spelleider ──────────────────────────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Spelleider', ${email}, 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `
  if (!spelleider) {
    console.error(`  Fout: kon spelleider niet aanmaken voor ${email}`)
    process.exit(1)
  }
  console.log(`  Spelleider: ${spelleider.id}`)

  // ─── Tour ────────────────────────────────────────────────────────────────────
  const aiConfig = {
    slug: 'mokka-nieuw-begin-ilona-renato',
    targetGroup: 'koppel, ondernemers, nieuw begin',
    location: 'Las Terrenas, Dominicaanse Republiek — Calle Duarte',
    country: 'DO',
    distanceKm: 3.2,
    difficulty: 'easy',
    language: 'nl',
    tags: ['romance', 'ondernemerschap', 'nieuw-begin', 'reflectie', 'dominicaanse-republiek'],
    themes: ['loslaten', 'terugkijken', 'waardering', 'doelen-stellen', 'dromen'],
    assistantPersona: 'Buddy',
    aiEvaluationPrompt: AI_EVALUATION_PROMPT,
    personalizedFor: 'Ilona & Renato — Mocca\'s Brunch Bar Las Terrenas',
    gpsNote: 'Verificeer Plaza Sabrina en Plaza Casa Linda op Google Maps en pas coördinaten aan via admin panel indien nodig.',
    generatedAt: new Date().toISOString(),
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
      ai_config
    ) VALUES (
      ${TOUR_NAME},
      'Een persoonlijke GPS-tocht voor Ilona & Renato: van de oude Mocca''s op Plaza Sabrina naar de nieuwe op Plaza Casa Linda. Terugkijken met liefde, elkaars kracht benoemen, nieuwe doelen stellen en de gedeelde droom uitspreken aan het water van Las Ballenas.',
      'familietocht',
      ${spelleider.id},
      false,
      210,
      1,
      0,
      'flat',
      0,
      ${JSON.stringify(aiConfig)}
    ) RETURNING id
  `
  console.log(`  Tour: "${TOUR_NAME}" (${tour.id})`)

  // ─── Checkpoints ─────────────────────────────────────────────────────────────
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
    console.log(`  CP${cp.orderIndex + 1}: ${cp.name}`)
  }

  // ─── Bestaande MOCCAS sessie opruimen ────────────────────────────────────────
  // Haal teams op die aan een sessie met code MOCCAS hangen (vanwege cascade delete)
  await sql`
    DELETE FROM game_sessions WHERE join_code = ${JOIN_CODE}
  `

  // ─── Game sessie (test mode aan — GPS-marge is soepeler) ─────────────────────
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
      ${JOIN_CODE},
      'familietocht',
      true,
      'Mocca''s Nieuw Begin — Ilona & Renato',
      'Welkom. Vandaag lopen jullie jullie eigen verhaal. Neem de tijd. Er is geen haast.',
      'direct'
    ) RETURNING id
  `
  console.log(`  Sessie: ${session.id} | code: ${JOIN_CODE}`)

  // ─── Team ────────────────────────────────────────────────────────────────────
  const teamToken = crypto.randomBytes(16).toString('hex')
  const [team] = await sql`
    INSERT INTO teams (
      game_session_id,
      name,
      team_token,
      is_active
    ) VALUES (
      ${session.id},
      'Ilona & Renato',
      ${teamToken},
      true
    ) RETURNING id
  `
  console.log(`  Team: "Ilona & Renato" (${team.id})`)

  // ─── Verificatie ──────────────────────────────────────────────────────────────
  const [verify] = await sql`
    SELECT t.name, COUNT(c.id)::int AS stops
    FROM tours t
    LEFT JOIN checkpoints c ON c.tour_id = t.id
    WHERE t.id = ${tour.id}
    GROUP BY t.name
  `

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  Mocca's Nieuw Begin — klaar voor Ilona & Renato                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  STAP 1 — open op de telefoon:                                       ║
║  ${(baseUrl + '/join?code=' + JOIN_CODE).padEnd(68)}║
║                                                                      ║
║  OF: ga naar /join en voer code in: ${JOIN_CODE.padEnd(33)}║
║                                                                      ║
║  Team: Ilona & Renato                                                ║
║  Token: ${teamToken.substring(0, 59)}║
║                                                                      ║
║  ROUTE (~4 km totaal, lus strand → Calle Duarte → strand):          ║
║  CP1  Pueblo de los Pescadores     19.3232, -69.5379  (start)        ║
║  CP2  Oude Mocca's (Plaza Sabrina) 19.3108, -69.5355  (~1.4 km)     ║
║  CP3  Calle Duarte — de oversteek  19.3100, -69.5410  (~500m)       ║
║  CP4  Lokale markt Calle Duarte    19.3098, -69.5432  (~260m)       ║
║  CP5  Nieuwe Mocca's (Casa Linda)  19.3096, -69.5441  (~200m)       ║
║  CP6  Playa Las Terrenas           19.3235, -69.5452  (~1.5 km)     ║
║                                                                      ║
║  LET OP: Verificeer CP2 (Plaza Sabrina) en CP5 (Casa Linda)         ║
║  op Google Maps — pas aan via /admin/tochten indien nodig.          ║
║                                                                      ║
║  TEST MODE aan — GPS-marge is ruimer (geen exacte positie nodig)    ║
║  Stops: ${String(verify.stops).padEnd(61)}║
║  Duur:  ~210 min (3.5 uur incl. pauzes)                             ║
╚══════════════════════════════════════════════════════════════════════╝
`)
}

seed().catch((e) => {
  console.error('Seed fout:', e)
  process.exit(1)
})
