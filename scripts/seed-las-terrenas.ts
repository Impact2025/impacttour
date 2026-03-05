/**
 * Seed: Las Terrenas Romántica — GPS-tocht voor koppels op het Samaná-schiereiland
 *
 * Gebruik:
 *   bun scripts/seed-las-terrenas.ts [jouw-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-las-terrenas.ts vincent@weareimpact.nl
 *
 * Wat dit maakt:
 *   - Tour "Las Terrenas Romántica" (6 checkpoints, ~4.5 km, 4 uur)
 *   - Idempotent: als de tocht al bestaat, wordt het script overgeslagen
 *
 * Overgeslagen velden (bestaan niet in schema):
 *   - slug (opgeslagen in aiConfig)
 *   - location, country, distanceKm, maxGmsScore, difficulty, language,
 *     coverImageUrl, tags (opgeslagen in aiConfig)
 *   - submissionType, impactUnit, arrivalTime (niet in checkpoints schema)
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// ─── GMS punt-verdeling per checkpoint ───────────────────────────────────────
// Schema slaat per-dimensie op (0-25 per dim). De opgegeven gmsPoints worden
// verdeeld per missie-thema. Totaal over alle 6 stops = 30 pt.

const checkpoints = [
  {
    orderIndex: 0,
    name: 'Stop 1 — Playa Punta Popy',
    type: 'kennismaking' as const,
    missionTitle: 'Wie kent de lokale taal?',
    missionDescription:
      'Leer van een lokale strandverkoper 3 Spaanse woorden voor dingen op het strand. Maak een selfie samen terwijl jullie één van de woorden uitbeelden. Upload de foto in de app.',
    missionType: 'foto',
    lat: 19.3265,
    lng: -69.5285,
    unlockRadius: 50,
    gmsConnection: 3,
    gmsMeaning: 0,
    gmsJoy: 2,
    gmsGrowth: 0,
    hint1: 'Zoek een verkoper die fruit, kokosnoten of souvenirs aanbiedt — zij staan er graag bij op de foto.',
    hint2: 'Vraag: "¿Cómo se dice... en español?" (Hoe zeg je ... in het Spaans?)',
    hint3: 'Geen perfecte selfie nodig — de meest authentieke foto wint altijd.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 1,
    name: 'Stop 2 — Mercado de Pescadores',
    type: 'actie' as const,
    missionTitle: 'Koop lokaal, steun lokaal',
    missionDescription:
      'Koop iets kleins bij een lokale verkoper (fruit, kokosnoot, handgemaakt product). Vraag zijn/haar naam en waar zij vandaan komen. Voer het gesprek in de app in: naam + herkomst + wat jullie hebben gekocht.',
    missionType: 'opdracht',
    lat: 19.3228,
    lng: -69.5321,
    unlockRadius: 60,
    gmsConnection: 2,
    gmsMeaning: 3,
    gmsJoy: 0,
    gmsGrowth: 0,
    hint1: 'Kleine aankoop is prima — een mango of kokosnoot volstaat.',
    hint2: 'Gebruik de naam van de verkoper als je het gesprek opschrijft. Dat maakt het persoonlijk.',
    hint3: 'Als iemand geen Engels of Nederlands spreekt: Google Translate werkt ook. Het gaat om de intentie.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 2,
    name: 'Stop 3 — Calle Principal – Dorpshart',
    type: 'kennismaking' as const,
    missionTitle: 'De Kleurencollectie',
    missionDescription:
      'Fotografeer samen 5 verschillende kleuren die jullie tegenkomen in de architectuur of straatkunst van Las Terrenas. Maak er een collage van in de app en geef elk kleur een naam die bij de sfeer past.',
    missionType: 'foto',
    lat: 19.3214,
    lng: -69.5384,
    unlockRadius: 80,
    gmsConnection: 5,
    gmsMeaning: 0,
    gmsJoy: 0,
    gmsGrowth: 0,
    hint1: 'Let op deuren, shutters, muurschilderingen en vissersboten — Las Terrenas is kleurrijker dan je denkt.',
    hint2: 'Geef kleuren namen uit jullie eigen wereld: "strandclub-turquoise", "oma-roze", "zonsondergang-oranje".',
    hint3: 'Geen perfecte foto\'s — vijf verschillende kleuren op één screenshot telt ook.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 3,
    name: 'Stop 4 — El Cayuco – Strand Lunch',
    type: 'feest' as const,
    missionTitle: 'Proef de Dominicaan',
    missionDescription:
      'Bestel iets van het menu wat je nog nooit hebt gegeten. Beschrijf de smaak in 3 woorden aan elkaar. Wie had de meest originele beschrijving? Noteer beide beschrijvingen in de app.',
    missionType: 'opdracht',
    lat: 19.3134,
    lng: -69.5650,
    unlockRadius: 100,
    gmsConnection: 2,
    gmsMeaning: 0,
    gmsJoy: 3,
    gmsGrowth: 0,
    hint1: 'Probeer tostones (gefrituurde plataan), mangu of sancocho als die op de kaart staan.',
    hint2: 'Drie woorden mogen van alles zijn: textuur, herinnering, gevoel — niet alleen smaak.',
    hint3: 'Oneens over wie de meest originele beschrijving had? Dan winnen jullie allebei.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 4,
    name: 'Stop 5 — Playa Las Ballenas – Schoonmaak',
    type: 'actie' as const,
    missionTitle: 'Laat het mooier achter dan je het vond',
    missionDescription:
      'Verzamel samen in 10 minuten zoveel mogelijk plastic of afval op het strand. Tel het aantal stuks en doe het in de vuilnisbak. Rapporteer het aantal in de app — dit gaat mee in de impact-score van de tocht.',
    missionType: 'opdracht',
    lat: 19.3260,
    lng: -69.5515,
    unlockRadius: 80,
    gmsConnection: 0,
    gmsMeaning: 3,
    gmsJoy: 0,
    gmsGrowth: 2,
    hint1: 'Gebruik een zak of tas die je meeneemt. Plastic flesjes, rietjes en snackzakjes zijn het meest voorkomend.',
    hint2: 'Tien minuten is echt tien minuten — zet een timer. Kwaliteit boven kwantiteit.',
    hint3: 'Nul stuks is ook een antwoord — soms is het strand al schoon. Eerlijkheid telt mee.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: 600, // 10 minuten
  },
  {
    orderIndex: 5,
    name: 'Stop 6 — Playa Las Ballenas West – Afsluiting',
    type: 'reflectie' as const,
    missionTitle: 'Jullie geluksmoment',
    missionDescription:
      'Schrijf elk één zin op in de app: \'Het mooiste moment van vandaag was...\' Deel de zinnen met elkaar. Dit wordt het persoonlijke GMS-moment van jullie tocht.',
    missionType: 'opdracht',
    lat: 19.3255,
    lng: -69.5570,
    unlockRadius: 100,
    gmsConnection: 3,
    gmsMeaning: 3,
    gmsJoy: 2,
    gmsGrowth: 2,
    hint1: 'Geen druk om het perfecte moment te kiezen — het mag een klein detail zijn.',
    hint2: 'Lees elkaars zin hardop voor. Dat maakt het concreet.',
    hint3: 'Jullie hoeven het niet eens te zijn over wat het mooiste moment was. Dat is juist mooi.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
]

const AI_EVALUATION_PROMPT =
  'Jullie hebben vandaag Las Terrenas samen ontdekt. Jullie hebben een lokale verkoper gesteund, ' +
  'de kleuren van de straat verzameld, plastic geraapt op een prachtig strand en jullie geluksmoment ' +
  'gedeeld. Beschrijf in 3 zinnen wat jullie tocht uniek maakte — en wat jullie volgende keer anders ' +
  'of verder zouden willen verkennen op het Samaná-schiereiland.'

async function seed() {
  const email = process.argv[2] || 'spelleider@impacttocht.nl'
  const TOUR_NAME = 'Las Terrenas Romántica'
  const TOUR_SLUG = 'las-terrenas-romantica'

  console.log('\nSeeding Las Terrenas Romántica...\n')
  console.log(`  Eigenaar: ${email}`)

  // ─── Idempotentie: controleer of tocht al bestaat ────────────────────────────
  const existing = await sql`
    SELECT id FROM tours WHERE name = ${TOUR_NAME} LIMIT 1
  `
  if (existing.length > 0) {
    console.warn(`\n  Waarschuwing: tocht "${TOUR_NAME}" bestaat al (id: ${existing[0].id}).`)
    console.warn('  Seed overgeslagen — verwijder de tour eerst als je opnieuw wilt seeden.\n')
    process.exit(0)
  }

  // ─── Spelleider ophalen of aanmaken ──────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Spelleider', ${email}, 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `
  if (!spelleider) {
    console.error(`\n  Fout: kon spelleider niet vinden of aanmaken voor: ${email}`)
    process.exit(1)
  }
  console.log(`  Spelleider id: ${spelleider.id}`)

  // ─── Tour aanmaken ────────────────────────────────────────────────────────────
  // Velden die niet bestaan in het schema worden opgeslagen in aiConfig:
  //   slug, location, country, distanceKm, maxGmsScore, difficulty, language, tags
  const aiConfig = {
    slug: TOUR_SLUG,
    targetGroup: 'koppel, romantisch, twee personen',
    location: 'Las Terrenas, Dominicaanse Republiek',
    country: 'DO',
    distanceKm: 4.5,
    maxGmsScore: 30,
    difficulty: 'easy',
    language: 'nl',
    tags: ['natuur', 'cultuur', 'sociale-impact', 'romance', 'dominicaanse-republiek'],
    themes: ['verbinding', 'cultuur', 'sociale-impact', 'romance'],
    assistantPersona: 'Buddy',
    aiEvaluationPrompt: AI_EVALUATION_PROMPT,
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
      'Ontdek Las Terrenas samen — van kleurrijke vissersboten tot kristalhelder water, van lokale markten tot verstilde baaitjes. Een GPS-tocht voor koppels met echte sociale impact.',
      'wijktocht',
      ${spelleider.id},
      false,
      240,
      2,
      0,
      'flat',
      0,
      ${JSON.stringify(aiConfig)}
    ) RETURNING id
  `
  console.log(`  Tour aangemaakt: "${TOUR_NAME}" (id: ${tour.id})`)

  // ─── Checkpoints aanmaken ─────────────────────────────────────────────────────
  // Overgeslagen velden (bestaan niet in schema): submissionType, tags, impactUnit, arrivalTime
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

  // ─── Verificatie query ────────────────────────────────────────────────────────
  const [verify] = await sql`
    SELECT t.name, COUNT(c.id)::int AS stops
    FROM tours t
    LEFT JOIN checkpoints c ON c.tour_id = t.id
    WHERE t.id = ${tour.id}
    GROUP BY t.name
  `
  console.log(`\n  Verificatie: "${verify.name}" met ${verify.stops} stops aangemaakt.`)

  console.log(`
  Tour id:   ${tour.id}
  Naam:      ${TOUR_NAME}
  Stops:     6
  Duur:      240 min (~4 uur)
  Afstand:   ~4.5 km
  Regio:     Las Terrenas, Dominicaanse Republiek
  Variant:   wijktocht (koppels)
  GMS max:   30 pt

  Beheer via admin panel: /admin/tochten
  Direct bewerken:        /admin/tochten (zoek op naam)
`)
  console.log(`  Tour "Las Terrenas Romántica" succesvol aangemaakt met 6 stops.`)
}

seed().catch((e) => {
  console.error('Seed fout:', e)
  process.exit(1)
})
