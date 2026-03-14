/**
 * Seed script: Haarlem Verbindt — WijkTocht
 *
 * Volledige WijkTocht door Haarlem-Centrum langs sociale organisaties:
 * Spaarne Gasthuis vrijwilligerspunt, Welzijn Schalkwijk, Bibliotheek,
 * WIJ Haarlem buurtteam, eindpunt aan de Spaarne.
 *
 * GPS-coördinaten zijn nauwkeurig maar kunnen 20-50m afwijken.
 * Finetunen via de kaarteditor in het admin-panel.
 *
 * Uitvoeren:
 *   bunx tsx scripts/seed-haarlem-wijktocht.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('\n🌱 Seeding Haarlem WijkTocht...\n')

  // ─── Spelleider ────────────────────────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Demo Spelleider', 'spelleider@impacttocht.nl', 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  console.log(`✓ Spelleider: ${spelleider.id}`)

  // ─── Tour ──────────────────────────────────────────────────────────────────
  const aiConfig = JSON.stringify({
    location: 'Haarlem',
    region: 'Noord-Holland',
    tagline: 'Ontdek de sociale kracht van Haarlem. Van de Spaarne tot de buurthuizen — verbindt je met de mensen die de stad dragen.',
    emoji: '🏛️',
    difficulty: 'gemiddeld',
    themes: ['gemeenschap', 'verbinding', 'vrijwilligers', 'zorg'],
    targetGroup: 'Bedrijven & teams',
  })

  const [tour] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams,
      pricing_model, price_per_person_cents, price_in_cents,
      ai_config
    ) VALUES (
      'Haarlem Verbindt',
      'Ontdek de sociale kracht van Haarlem. Van de bruisende Grote Markt tot de stille buurtcentra in de wijken — in 2 uur ontdek je de organisaties en mensen die de stad dragen. Verbindt je team, meet jullie impact en ga naar huis met een persoonlijk rapport.',
      'wijktocht',
      ${spelleider.id},
      true,
      120,
      15,
      'per_person',
      3900,
      0,
      ${aiConfig}
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tour) {
    console.log('! Tour "Haarlem Verbindt" bestaat al, sla over.')
    return
  }
  console.log(`✓ Tour: Haarlem Verbindt (id: ${tour.id})`)

  // ─── Checkpoints ──────────────────────────────────────────────────────────
  // Route: Vrijwilligerspunt → Bibliotheek → Buurtcentrum → WIJ Haarlem → Spaarne
  // Totale looproute: ~2.5 km door Haarlem-Centrum en omgeving
  const checkpoints = [
    {
      order: 0,
      name: 'Vrijwilligerspunt Haarlem',
      description: 'Vrijwilligerspunt Haarlem — koppelt vrijwilligers aan maatschappelijke organisaties in de stad',
      type: 'kennismaking',
      lat: 52.3808, lng: 4.6370,
      missionTitle: 'Maak kennis met Haarlem',
      missionDesc: 'Jullie staan bij het Vrijwilligerspunt van Haarlem — het hart van maatschappelijke betrokkenheid in de stad. Maak een groepsfoto bij het gebouw. Daarna: elk teamlid deelt in één zin waarom vrijwilligerswerk belangrijk is voor hem of haar. Bespreek: wat zou jullie organisatie kunnen bijdragen als vrijwilliger in Haarlem? Schrijf jullie top-3 ideeën op.',
      missionType: 'foto',
      connection: 20, meaning: 15, joy: 10, growth: 10,
      hint1: 'Zoek het Vrijwilligerspunt in het centrum van Haarlem, vlakbij het Stadhuis',
      hint2: 'Het Vrijwilligerspunt bevindt zich bij de Raaks of in het centrum naast het gemeentehuis',
      hint3: 'Vraag een voorbijganger naar het Vrijwilligerspunt Haarlem — iedereen kent het',
    },
    {
      order: 1,
      name: 'Bibliotheek Haarlem — De Informatiefabriek',
      description: 'De Bibliotheek Haarlem aan het Gymnasium Spaarne — toegankelijke kennis en ontmoeting voor alle Haarlemmers',
      type: 'reflectie',
      lat: 52.3830, lng: 4.6385,
      missionTitle: 'Kennis voor iedereen',
      missionDesc: 'De bibliotheek is gratis voor iedereen — een plek van gelijke kansen. Ga naar binnen en zoek samen een boek, tijdschrift of informatiegids die past bij het werk of de missie van jullie organisatie. Maak een foto ermee. Bespreek: "Welke kennis of vaardigheid zou jij gratis willen delen met de Haarlemse samenleving?" Elk teamlid schrijft zijn/haar antwoord op.',
      missionType: 'foto',
      connection: 10, meaning: 25, joy: 10, growth: 20,
      hint1: 'De bibliotheek staat aan het Gymnasium Spaarne, vlakbij het centrum',
      hint2: 'Zoek het grote, moderne gebouw met de glazen gevel aan de Spaarne',
      hint3: 'De bibliotheek van Haarlem is één van de mooiste van Nederland — aan de Spaarne rivier',
    },
    {
      order: 2,
      name: 'Slachthuisbuurt — Bruisende Volksbuurt',
      description: 'De Slachthuisbuurt — een van de meest sociale en diverse buurten van Haarlem',
      type: 'samenwerking',
      lat: 52.3840, lng: 4.6410,
      missionTitle: 'Buurtbarometer',
      missionDesc: 'De Slachthuisbuurt staat bekend als een hechte, diverse buurt met veel zelforganisatie. Jullie opdracht: interview minimaal 2 bewoners of winkeliers. Vraag: "Wat is het mooiste aan jouw buurt?" en "Wat zou hier beter kunnen?" Fotografeer jullie "interviewer moment". Schrijf de beste antwoorden op — jullie dragen bij aan een echte sociale buurtanalyse!',
      missionType: 'foto',
      connection: 20, meaning: 15, joy: 20, growth: 10,
      hint1: 'Loop vanuit het centrum richting het noorden — de Slachthuisbuurt ligt net buiten het centrum',
      hint2: 'Zoek de buurt achter het station of de Kleine Houtweg — druk en levendig',
      hint3: 'De Slachthuisbuurt heeft kleurrijke muurschilderingen en veel kleine winkeltjes',
    },
    {
      order: 3,
      name: 'WIJ Haarlem — Buurtteam',
      description: 'WIJ Haarlem buurtteam — sociaal wijkteam dat bewoners ondersteunt bij zorg, welzijn en participatie',
      type: 'actie',
      lat: 52.3795, lng: 4.6400,
      missionTitle: 'Sociale Impact Plan',
      missionDesc: 'WIJ Haarlem ondersteunt honderden bewoners per jaar bij zorg, schulden, eenzaamheid en participatie. Jullie missie: bedenk als team een concrete sociale actie die jullie organisatie in de komende 3 maanden kan uitvoeren in samenwerking met een sociaal wijkteam zoals WIJ. Schrijf een mini-plan: Wat? Wie doet wat? Hoeveel mensen helpen jullie? Presenteer en stem op het beste plan.',
      missionType: 'opdracht',
      connection: 15, meaning: 25, joy: 10, growth: 15,
      hint1: 'WIJ Haarlem heeft meerdere locaties in de wijken — zoek het dichtstbijzijnde buurtteam',
      hint2: 'WIJ-locaties zijn herkenbaar aan het WIJ-logo bij de ingang — vlakbij een wooncomplex of wijkcentrum',
      hint3: 'Vraag een bewoner naar het wijkteam WIJ Haarlem — zij kennen altijd de weg',
    },
    {
      order: 4,
      name: 'Spaarne Kade — Eindpunt',
      description: 'De kade aan de Spaarne — het iconische water van Haarlem, eindpunt van de WijkTocht',
      type: 'feest',
      lat: 52.3808, lng: 4.6355,
      missionTitle: 'Haarlem Heeft Impact!',
      missionDesc: 'Jullie hebben Haarlem Verbindt voltooid! Sta samen aan de Spaarne. Film een 45-seconden overwinningsvideo: elk teamlid vertelt (1) het meest verrassende dat ze vandaag ontdekten over Haarlem, en (2) één concrete stap die ze persoonlijk gaan zetten. Upload de video — jullie zijn officiële Impact Ambassadeurs van Haarlem!',
      missionType: 'video',
      connection: 25, meaning: 15, joy: 25, growth: 10,
      hint1: 'Loop richting de Spaarne rivier in het centrum van Haarlem',
      hint2: 'De Spaarne is de rivier die door het centrum stroomt — zoek de kade met de historische grachtenpanden',
      hint3: 'Het eindpunt is bij de Spaarne kade, dicht bij de Grote Kerk of de Gravestenenbrug',
    },
  ]

  for (const cp of checkpoints) {
    await sql`
      INSERT INTO checkpoints (
        tour_id, order_index, name, description, type,
        latitude, longitude, unlock_radius_meters,
        mission_title, mission_description, mission_type,
        gms_connection, gms_meaning, gms_joy, gms_growth,
        hint1, hint2, hint3, is_kids_friendly
      ) VALUES (
        ${tour.id}, ${cp.order}, ${cp.name}, ${cp.description}, ${cp.type},
        ${cp.lat}, ${cp.lng}, 50,
        ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
        ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
        ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, false
      )
    `
    console.log(`  ✓ CP ${cp.order + 1}: ${cp.name} [${cp.lat}, ${cp.lng}]`)
  }

  // ─── Demo sessie ──────────────────────────────────────────────────────────
  const [session] = await sql`
    INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
    VALUES (${tour.id}, ${spelleider.id}, 'lobby', 'HRLM01', 'wijktocht')
    ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
    RETURNING id
  `
  console.log(`\n✓ Sessie: HRLM01 (id: ${session.id})`)

  // ─── Demo teams ───────────────────────────────────────────────────────────
  const teams = [
    { name: 'Team Spaarne',     token: 'token-hl-spaarne-01' },
    { name: 'Team Schalkwijk',  token: 'token-hl-schalkwijk-02' },
    { name: 'Team Verbinding',  token: 'token-hl-verbinding-03' },
  ]
  for (const team of teams) {
    await sql`
      INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
      VALUES (${session.id}, ${team.name}, ${team.token}, 0)
      ON CONFLICT (team_token) DO NOTHING
    `
    console.log(`  ✓ Team: ${team.name}`)
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Haarlem WijkTocht seed compleet!

📍 Haarlem Verbindt
   Joincode:  HRLM01
   Prijs:     €39 p.p. excl. BTW
   Route:     Vrijwilligerspunt → Bibliotheek → Slachthuisbuurt → WIJ Haarlem → Spaarne
   Afstand:   ~2.5 km looproute
   Duur:      120 min

⚠️  GPS-VERIFICATIE VEREIST:
   Coördinaten zijn approximate — controleer via Admin → Kaarteditor

📱 Testen:
   1. Log in als spelleider@impacttocht.nl
   2. Start sessie met joincode HRLM01
   3. Teams joinen via /join
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
