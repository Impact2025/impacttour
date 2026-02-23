import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('\n🌱 Seeding demo data...\n')

  // ─── Demo spelleider ────────────────────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Demo Spelleider', 'spelleider@impacttocht.nl', 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  console.log(`✓ Spelleider: spelleider@impacttocht.nl (id: ${spelleider.id})`)

  // ─── Admin user ──────────────────────────────────────────────────────────────
  // Admin logt in via credentials (email+wachtwoord in .env.local)
  // Bij eerste login wordt de user automatisch aangemaakt door NextAuth
  console.log('✓ Admin: admin@impacttocht.nl / Demo2024! (via credentials login)')

  // ─── Demo tour: Amsterdamse WijkTocht ────────────────────────────────────────
  const [tour] = await sql`
    INSERT INTO tours (name, description, variant, created_by_id, is_published, estimated_duration_min, max_teams, price_in_cents)
    VALUES (
      'Amsterdamse WijkTocht',
      'Ontdek de buurt en maak verbinding met je collega''s tijdens deze interactieve wandeltocht door Amsterdam-Centrum.',
      'wijktocht',
      ${spelleider.id},
      true,
      120,
      10,
      0
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tour) {
    console.log('! Tour bestaat al, sla checkpoints over')
  } else {
    console.log(`✓ Tour: Amsterdamse WijkTocht (id: ${tour.id})`)

    // ─── Checkpoints (Amsterdam Centrum) ─────────────────────────────────────
    const checkpoints = [
      {
        order: 0,
        name: 'Dam Square Ontmoeting',
        description: 'Startpunt bij de Dam',
        type: 'kennismaking',
        lat: 52.3731, lng: 4.8936,
        missionTitle: 'Ken jouw team!',
        missionDesc: 'Stel jezelf voor met 3 woorden die jou beschrijven. Fotografeer jullie groep voor het Nationaal Monument.',
        missionType: 'foto',
        connection: 20, meaning: 5, joy: 15, growth: 5,
        hint1: 'Ga naar het grote plein in het centrum van Amsterdam',
        hint2: 'Zoek het witte monument met de adelaar bovenop',
        hint3: 'Het Nationaal Monument staat op de Dam, tegenover het Paleis op de Dam',
      },
      {
        order: 1,
        name: 'Begijnhof Reflectie',
        description: 'Rustige historische hofje',
        type: 'reflectie',
        lat: 52.3696, lng: 4.8905,
        missionTitle: 'Wat geeft jou energie?',
        missionDesc: 'Ga in het Begijnhof zitten en schrijf samen op: welke drie dingen geven jouw team de meeste energie op het werk?',
        missionType: 'opdracht',
        connection: 10, meaning: 20, joy: 10, growth: 10,
        hint1: 'Zoek een verborgen hofje vlakbij de Kalverstraat',
        hint2: 'Ga de Begijnensteeg in via de Nieuwezijds Voorburgwal',
        hint3: 'Het Begijnhof heeft een houten huis uit 1425 - kijk naar de gevels',
      },
      {
        order: 2,
        name: 'Jordaan Samenwerking',
        description: 'Gezellige buurt in de Jordaan',
        type: 'samenwerking',
        lat: 52.3751, lng: 4.8826,
        missionTitle: 'Menselijke toren!',
        missionDesc: 'Bouw met jullie hele team een menselijke toren of piramide op de Noordermarkt. Maak een foto als bewijs.',
        missionType: 'foto',
        connection: 15, meaning: 5, joy: 25, growth: 5,
        hint1: 'Loop door de grachten richting het westen van het centrum',
        hint2: 'De Jordaan ligt tussen de Prinsengracht en de Lijnbaansgracht',
        hint3: 'De Noordermarkt is het plein bij de Noorderkerk',
      },
      {
        order: 3,
        name: 'Anne Frank Huis Actie',
        description: 'Historische locatie aan de Prinsengracht',
        type: 'actie',
        lat: 52.3752, lng: 4.8840,
        missionTitle: 'Brief aan de toekomst',
        missionDesc: 'Schrijf als team een korte brief (max 5 zinnen) aan jullie bedrijf over de impact die jullie samen willen maken. Lees hem hardop voor.',
        missionType: 'opdracht',
        connection: 10, meaning: 25, joy: 5, growth: 10,
        hint1: 'Zoek het huis van de beroemde dagboekschrijfster aan de Prinsengracht',
        hint2: 'Anne Frank Huis staat op Prinsengracht 263',
        hint3: 'Het huis heeft een smalle bruine gevel met groene luiken',
      },
      {
        order: 4,
        name: 'Vondelpark Feest',
        description: 'Eindpunt in het Vondelpark',
        type: 'feest',
        lat: 52.3581, lng: 4.8686,
        missionTitle: 'Overwinningsdans!',
        missionDesc: 'Jullie hebben de tocht volbracht! Film een 30-seconden overwinningsvideo met jullie team. Wees creatief!',
        missionType: 'video',
        connection: 20, meaning: 10, joy: 25, growth: 20,
        hint1: 'Het grootste park van Amsterdam, ten zuiden van het centrum',
        hint2: 'Het Vondelpark ligt naast het Leidseplein',
        hint3: 'Ga naar het open theater in het midden van het park',
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
          ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, true
        )
      `
      console.log(`  ✓ Checkpoint ${cp.order + 1}: ${cp.name}`)
    }

    // ─── Demo game sessie ─────────────────────────────────────────────────────
    const [session] = await sql`
      INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
      VALUES (${tour.id}, ${spelleider.id}, 'lobby', 'DEMO01', 'wijktocht')
      ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
      RETURNING id
    `
    console.log(`\n✓ Game sessie aangemaakt (joincode: DEMO01, id: ${session.id})`)

    // ─── Demo teams ───────────────────────────────────────────────────────────
    const teams = [
      { name: 'Team Groen', token: 'token-groen-demo-001' },
      { name: 'Team Oranje', token: 'token-oranje-demo-002' },
      { name: 'Team Blauw', token: 'token-blauw-demo-003' },
    ]

    for (const team of teams) {
      await sql`
        INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
        VALUES (${session.id}, ${team.name}, ${team.token}, 0)
        ON CONFLICT (team_token) DO NOTHING
      `
      console.log(`  ✓ Team: ${team.name}`)
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed compleet!

📋 Demo accounts:

  Admin
  Email:    admin@impacttocht.nl
  Wachtw:   Demo2024!
  Login:    http://localhost:7070/login

  Spelleider (magic link — geen wachtwoord)
  Email:    spelleider@impacttocht.nl
  Login:    http://localhost:7070/login

📍 Demo tour: Amsterdamse WijkTocht
   5 checkpoints, joincode: DEMO01
   Teams: Groen, Oranje, Blauw

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
