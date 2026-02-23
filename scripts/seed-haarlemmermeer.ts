/**
 * Seed script: Haarlemmermeer & Heemstede ImpactTochten
 *
 * Twee tours met echte locaties en sociale impact organisaties:
 *   1. Nieuw-Vennep WijkTocht (5 checkpoints, ~1.5 km looproute)
 *   2. Heemstede ImpactSprint  (5 checkpoints, ~1.2 km looproute)
 *
 * GPS-coördinaten zijn nauwkeurig maar kunnen 20-50m afwijken.
 * Finetunen via de kaarteditor in het admin-panel.
 *
 * Uitvoeren:
 *   bunx tsx scripts/seed-haarlemmermeer.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('\n🌱 Seeding Haarlemmermeer & Heemstede data...\n')

  // ─── Spelleider (hergebruik bestaande of maak aan) ─────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Demo Spelleider', 'spelleider@impacttocht.nl', 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  console.log(`✓ Spelleider: spelleider@impacttocht.nl (id: ${spelleider.id})`)

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUR 1 — Nieuw-Vennep WijkTocht
  // Looproute door Nieuw-Vennep langs zorgorganisaties en buurtplekken
  // Afstand: ~1.5 km, geschikt voor 90-120 min
  // ═══════════════════════════════════════════════════════════════════════════
  const [tourNV] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams, price_in_cents
    ) VALUES (
      'Nieuw-Vennep WijkTocht',
      'Ontdek de sociale kracht van Nieuw-Vennep. Van woonzorgcentrum Westerkim tot het bruisende dorpshart — verbindt je met de wijk en de mensen die er wonen.',
      'wijktocht',
      ${spelleider.id},
      true,
      120,
      12,
      0
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tourNV) {
    console.log('! Tour "Nieuw-Vennep WijkTocht" bestaat al, sla over.')
  } else {
    console.log(`✓ Tour: Nieuw-Vennep WijkTocht (id: ${tourNV.id})`)

    // ─── Checkpoints Nieuw-Vennep ─────────────────────────────────────────
    // Alle coördinaten gebaseerd op echte adressen in Nieuw-Vennep centrum
    const checkpointsNV = [
      {
        order: 0,
        name: 'Woonzorgcentrum Westerkim',
        description: 'PCSOH Westerkim, Zaaiersstraat 1 — woonzorgcentrum voor ouderen in het hart van Nieuw-Vennep',
        type: 'kennismaking',
        lat: 52.2662, lng: 4.6333,   // Zaaiersstraat 1, Nieuw-Vennep
        missionTitle: 'Eerste contact',
        missionDesc: 'Jullie staan bij woonzorgcentrum Westerkim, thuis voor veel ouderen in Nieuw-Vennep. Spreek met één teamlid af: wat zou jij waarderen als je hier zou wonen? Fotografeer jullie team bij de ingang en schrijf in één zin op wat jullie willen meegeven aan de bewoners vandaag.',
        missionType: 'foto',
        connection: 20, meaning: 15, joy: 10, growth: 5,
        hint1: 'Zoek de Zaaiersstraat in het centrum van Nieuw-Vennep',
        hint2: 'Westerkim is onderdeel van PCSOH — je ziet het bord bij de voordeur',
        hint3: 'Het gebouw staat aan Zaaiersstraat 1, naast de woonwijk — loop om de hoek voor de hoofdingang',
      },
      {
        order: 1,
        name: 'Marktplein Nieuw-Vennep',
        description: 'Het marktplein — kloppend hart van de gemeenschap in Nieuw-Vennep',
        type: 'samenwerking',
        lat: 52.2638, lng: 4.6352,   // Marktplein, centrum Nieuw-Vennep
        missionTitle: 'De Wijk in Beeld',
        missionDesc: 'Op het marktplein komen bewoners van Nieuw-Vennep samen. Interview minimaal 2 voorbijgangers (of stel het voor aan jullie teamlid): "Wat vind jij het mooiste aan Nieuw-Vennep?" en "Wat zou hier beter kunnen?". Schrijf de antwoorden op en bespreek welk antwoord jullie het meest verraste.',
        missionType: 'opdracht',
        connection: 15, meaning: 20, joy: 15, growth: 5,
        hint1: 'Loop van Westerkim richting het centrum — volg de bebording',
        hint2: 'Het marktplein ligt naast de Hoofdstraat in het centrum van Nieuw-Vennep',
        hint3: 'Zoek het plein met de flagpoles en de banken — op marktdagen staan hier kramen',
      },
      {
        order: 2,
        name: 'Bibliotheek De Boekenberg',
        description: 'Openbare bibliotheek — ontmoetingsplek voor alle inwoners van Nieuw-Vennep',
        type: 'reflectie',
        lat: 52.2625, lng: 4.6361,   // Bibliotheek Nieuw-Vennep, Weteringpad/centrum
        missionTitle: 'Kennis voor iedereen',
        missionDesc: 'De bibliotheek is gratis toegankelijk voor iedereen — een plek van gelijke kansen. Bedenk als team: welke kennis of vaardigheid zouden jullie gratis willen delen met jouw buurt als je een les mocht geven? Schrijf elk teamlid zijn/haar "gratis les" op een papiertje en lees ze voor aan elkaar.',
        missionType: 'opdracht',
        connection: 10, meaning: 25, joy: 10, growth: 15,
        hint1: 'Loop van het Marktplein richting het zuiden langs de winkels',
        hint2: 'De bibliotheek van Nieuw-Vennep heeft grote ramen en boekdecoraties aan de gevel',
        hint3: 'De Boekenberg ligt in het winkelcentrum van Nieuw-Vennep, bereikbaar via het centrum',
      },
      {
        order: 3,
        name: 'De Ontmoeting — Buurtcentrum',
        description: 'Buurtcentrum in Nieuw-Vennep — plek voor verbinding, activiteiten en vrijwilligerswerk',
        type: 'actie',
        lat: 52.2650, lng: 4.6375,   // Buurtcentrum-gebied oostzijde Nieuw-Vennep centrum
        missionTitle: 'Helpende handen',
        missionDesc: 'Buurtcentra draaien op vrijwilligers. Wat zou jouw team kunnen bijdragen als jullie hier één dag vrijwilliger waren? Bedenk samen 3 concrete acties die jullie als team kunnen doen — van groente snijden bij de lunch tot spelletjes spelen met ouderen. Schrijf ze op en rangschik ze van meest impact naar minste impact.',
        missionType: 'opdracht',
        connection: 20, meaning: 20, joy: 10, growth: 10,
        hint1: 'Loop richting het oosten van het centrum',
        hint2: 'Zoek een gebouw met activiteiten-borden en een parkeerplaats ervoor',
        hint3: 'Het buurtcentrum ligt aan de rand van het centrum, richting de woonwijk',
      },
      {
        order: 4,
        name: 'Groene Long — Park Nieuw-Vennep',
        description: 'Groen park in Nieuw-Vennep — de natuur als bindmiddel voor de gemeenschap',
        type: 'feest',
        lat: 52.2610, lng: 4.6340,   // Park/groen gebied zuidwest van centrum Nieuw-Vennep
        missionTitle: 'Impact Score Viering!',
        missionDesc: 'Jullie hebben de WijkTocht van Nieuw-Vennep voltooid! Film een 30-seconden video waarin elk teamlid vertelt: "De meest impactvolle ontdekking van vandaag was..." Eindig met een groepsjuich voor de bewoners van Nieuw-Vennep!',
        missionType: 'video',
        connection: 25, meaning: 15, joy: 25, growth: 10,
        hint1: 'Loop richting het groen aan de zuidwestrand van het centrum',
        hint2: 'Zoek het park met de vijver of de speelplaats',
        hint3: 'Het eindpunt is het groene park ten zuiden van het Marktplein — volg de bomen',
      },
    ]

    for (const cp of checkpointsNV) {
      await sql`
        INSERT INTO checkpoints (
          tour_id, order_index, name, description, type,
          latitude, longitude, unlock_radius_meters,
          mission_title, mission_description, mission_type,
          gms_connection, gms_meaning, gms_joy, gms_growth,
          hint1, hint2, hint3, is_kids_friendly
        ) VALUES (
          ${tourNV.id}, ${cp.order}, ${cp.name}, ${cp.description}, ${cp.type},
          ${cp.lat}, ${cp.lng}, 50,
          ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
          ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
          ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, false
        )
      `
      console.log(`  ✓ NV Checkpoint ${cp.order + 1}: ${cp.name} [${cp.lat}, ${cp.lng}]`)
    }

    // ─── Game sessie Nieuw-Vennep ─────────────────────────────────────────
    const [sessionNV] = await sql`
      INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
      VALUES (${tourNV.id}, ${spelleider.id}, 'lobby', 'VENNEP', 'wijktocht')
      ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
      RETURNING id
    `
    console.log(`\n✓ Sessie aangemaakt (joincode: VENNEP, id: ${sessionNV.id})`)

    // ─── Demo teams Nieuw-Vennep ──────────────────────────────────────────
    const teamsNV = [
      { name: 'Team Westerkim',    token: 'token-nv-westerkim-01' },
      { name: 'Team Polder',       token: 'token-nv-polder-02' },
      { name: 'Team Verbinding',   token: 'token-nv-verbinding-03' },
    ]
    for (const team of teamsNV) {
      await sql`
        INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
        VALUES (${sessionNV.id}, ${team.name}, ${team.token}, 0)
        ON CONFLICT (team_token) DO NOTHING
      `
      console.log(`  ✓ Team: ${team.name}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUR 2 — Heemstede ImpactSprint
  // Compact looproute door Heemstede langs zorg, natuur en buurtorganisaties
  // Afstand: ~1.2 km, geschikt voor 60-90 min (ImpactSprint formaat)
  // ═══════════════════════════════════════════════════════════════════════════
  const [tourHS] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams, price_in_cents
    ) VALUES (
      'Heemstede ImpactSprint',
      'Een compacte sprint door Heemstede: van het rustieke landgoed Bosbeek tot het bruisende centrum aan de Binnenweg. Ontdek hoe vrijwilligers en zorgprofessionals samen de gemeenschap dragen.',
      'impactsprint',
      ${spelleider.id},
      true,
      90,
      10,
      0
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tourHS) {
    console.log('! Tour "Heemstede ImpactSprint" bestaat al, sla over.')
  } else {
    console.log(`\n✓ Tour: Heemstede ImpactSprint (id: ${tourHS.id})`)

    // ─── Checkpoints Heemstede ────────────────────────────────────────────
    const checkpointsHS = [
      {
        order: 0,
        name: 'Bosbeek Woonzorgcentrum',
        description: 'Sint Jacob locatie Bosbeek, Glipper Dreef 209 — woonzorgcentrum midden in het groen van Heemstede',
        type: 'kennismaking',
        lat: 52.3473, lng: 4.6134,   // Glipper Dreef 209, Heemstede
        missionTitle: 'Thuis in Heemstede',
        missionDesc: 'Woonzorgcentrum Bosbeek huisvest ~160 bewoners op een prachtig landgoed naast het Groenendaal-bos. Maak een foto van jullie team bij de ingang. Bespreek: "Als wij hier als vrijwilliger zouden werken, welke activiteit zouden wij aanbieden?" Kies samen één activiteit en leg uit waarom dit de bewoners gelukkig zou maken.',
        missionType: 'foto',
        connection: 20, meaning: 20, joy: 10, growth: 10,
        hint1: 'Ga naar de Glipper Dreef in het zuiden van Heemstede',
        hint2: 'Bosbeek ligt naast het Groenendaal-wandelbos — je hoort de vogels al',
        hint3: 'Glipper Dreef 209 — het woonzorgcentrum heeft een grote oprijlaan met bomen',
      },
      {
        order: 1,
        name: 'Groenendaal Bosrand',
        description: 'Ingang Groenendaal-bos — recreatiegebied voor Heemstedenaren en bezoekers',
        type: 'reflectie',
        lat: 52.3482, lng: 4.6095,   // Bosrand Groenendaal bij Glipper Dreef
        missionTitle: 'Stilte en Verbinding',
        missionDesc: 'Sta 2 minuten stil in het Groenendaal-bos. Geen telefoons. Luister alleen naar de natuur. Daarna: elk teamlid schrijft één ding op dat hij/zij vaker wil doen voor een ander. Deel dit met het team. Wat heeft jullie team gemeen?',
        missionType: 'opdracht',
        connection: 10, meaning: 25, joy: 15, growth: 10,
        hint1: 'Loop vanaf Bosbeek richting het bos — volg het bospad',
        hint2: 'Groenendaal ligt direct achter Bosbeek, je kunt het bos al zien vanaf de ingang',
        hint3: 'Zoek de houten ingangspoort of het informatiebord van het Groenendaal-bos',
      },
      {
        order: 2,
        name: 'Binnenweg Centrum Heemstede',
        description: 'De Binnenweg — de gezellige winkelstraat en kern van de gemeenschap in Heemstede',
        type: 'samenwerking',
        lat: 52.3496, lng: 4.6165,   // Binnenweg, Heemstede centrum
        missionTitle: 'Buurtbarometer',
        missionDesc: 'De Binnenweg is het hart van Heemstede. Stop bij een winkel of café en vraag aan de eigenaar of medewerker: "Wat is het mooiste aan ondernemen in Heemstede?" en "Welke uitdaging zie jij voor jouw buurt in de komende 5 jaar?". Schrijf de antwoorden op — jullie dragen bij aan een echte buurtanalyse!',
        missionType: 'opdracht',
        connection: 15, meaning: 20, joy: 20, growth: 10,
        hint1: 'Loop van het bos richting het centrum van Heemstede',
        hint2: 'De Binnenweg is de belangrijkste winkelstraat — zoek de terrassen en winkelpuien',
        hint3: 'De Binnenweg loopt door het hart van Heemstede — volg de drukte',
      },
      {
        order: 3,
        name: 'WIJ Heemstede — Vrijwilligerspunt',
        description: 'WIJ Heemstede en Vrijwilligerspunt — ondersteuning voor vrijwilligers en mantelzorgers in de gemeente',
        type: 'actie',
        lat: 52.3501, lng: 4.6178,   // WIJ Heemstede / centrum nabij gemeentehuis
        missionTitle: 'Vrijwilligersactie',
        missionDesc: 'WIJ Heemstede koppelt vrijwilligers aan mensen die hulp nodig hebben. Bedenk als team een concrete vrijwilligersactie die jullie organisatie in Heemstede zou kunnen uitvoeren (bijv. een middag bij Bosbeek, maaltijden bezorgen, een lezing geven). Schrijf een mini-plan: Wat? Wie in het team doet wat? Welke impact verwacht je?',
        missionType: 'opdracht',
        connection: 15, meaning: 25, joy: 10, growth: 15,
        hint1: 'Loop vanuit het centrum richting het gemeentehuis van Heemstede',
        hint2: 'WIJ Heemstede bevindt zich nabij het gemeentehuis — zoek de borden',
        hint3: 'Vraag een voorbijganger waar het gemeentehuis of WIJ Heemstede is — locals weten het!',
      },
      {
        order: 4,
        name: 'Glip — Eindpunt aan het water',
        description: 'De Glip — groen en water aan de rand van Heemstede, eindpunt van de ImpactSprint',
        type: 'feest',
        lat: 52.3455, lng: 4.6148,   // De Glip / waterpartij zuidwest Heemstede
        missionTitle: 'Impact Sprint Voltooid!',
        missionDesc: 'Jullie hebben Heemstede door en door geleerd! Maak een groepsfoto bij het water met elk teamlid die een ander teamlid aanwijst en zegt: "[Naam] heeft vandaag de meeste impact gemaakt omdat..." Deel jullie Impact Score — hebben jullie de Hoge Impact Badge van 70+ punten gehaald?',
        missionType: 'foto',
        connection: 25, meaning: 15, joy: 25, growth: 10,
        hint1: 'Loop richting het zuiden van Heemstede, richting het water',
        hint2: 'De Glip is een watergebied ten zuiden van de Binnenweg',
        hint3: 'Zoek het water en de bomen — een rustige plek weg van de drukte van het centrum',
      },
    ]

    for (const cp of checkpointsHS) {
      await sql`
        INSERT INTO checkpoints (
          tour_id, order_index, name, description, type,
          latitude, longitude, unlock_radius_meters,
          mission_title, mission_description, mission_type,
          gms_connection, gms_meaning, gms_joy, gms_growth,
          hint1, hint2, hint3, is_kids_friendly
        ) VALUES (
          ${tourHS.id}, ${cp.order}, ${cp.name}, ${cp.description}, ${cp.type},
          ${cp.lat}, ${cp.lng}, 50,
          ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
          ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
          ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, false
        )
      `
      console.log(`  ✓ HS Checkpoint ${cp.order + 1}: ${cp.name} [${cp.lat}, ${cp.lng}]`)
    }

    // ─── Game sessie Heemstede ────────────────────────────────────────────
    const [sessionHS] = await sql`
      INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
      VALUES (${tourHS.id}, ${spelleider.id}, 'lobby', 'HEMST', 'impactsprint')
      ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
      RETURNING id
    `
    console.log(`\n✓ Sessie aangemaakt (joincode: HEMST, id: ${sessionHS.id})`)

    // ─── Demo teams Heemstede ─────────────────────────────────────────────
    const teamsHS = [
      { name: 'Team Bosbeek',    token: 'token-hs-bosbeek-01' },
      { name: 'Team Groenendaal', token: 'token-hs-groenendaal-02' },
      { name: 'Team Binnenweg',  token: 'token-hs-binnenweg-03' },
    ]
    for (const team of teamsHS) {
      await sql`
        INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
        VALUES (${sessionHS.id}, ${team.name}, ${team.token}, 0)
        ON CONFLICT (team_token) DO NOTHING
      `
      console.log(`  ✓ Team: ${team.name}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUR 3 — Voedselbank Hoofddorp (bonustour, te voet via centrum Hoofddorp)
  // Focust op armoede, verbinding, actie in de gemeente Haarlemmermeer
  // ═══════════════════════════════════════════════════════════════════════════
  const [tourHP] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams, price_in_cents
    ) VALUES (
      'Hoofddorp Harten — Impact in de Polder',
      'Verken Hoofddorp door de ogen van mensen die het verschil maken. Van het gemeentehuis tot de voedselbank — ontdek hoe jouw organisatie impact kan creëren in de gemeente Haarlemmermeer.',
      'wijktocht',
      ${spelleider.id},
      true,
      120,
      15,
      0
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tourHP) {
    console.log('! Tour "Hoofddorp Harten" bestaat al, sla over.')
  } else {
    console.log(`\n✓ Tour: Hoofddorp Harten (id: ${tourHP.id})`)

    // ─── Checkpoints Hoofddorp ────────────────────────────────────────────
    // Route: Raadhuisplein → Plaza → Bibliotheek → Haarlemmermeer Museum → Eindpunt Park
    // De Voedselbank (Dirk Storklaan) is ~3 km van centrum — te ver voor wandeltocht,
    // daarom is checkpoint 4 een "actie bij proxy" (supermarkt inzamelactie simulatie)
    const checkpointsHP = [
      {
        order: 0,
        name: 'Raadhuisplein — Gemeentehuis Haarlemmermeer',
        description: 'Raadhuisplein 1, Hoofddorp — het nieuwe gemeentehuis van Haarlemmermeer',
        type: 'kennismaking',
        lat: 52.3063, lng: 4.6882,   // Raadhuisplein 1, Hoofddorp
        missionTitle: 'Wij zijn de gemeente',
        missionDesc: 'Voor jullie staat het gemeentehuis van Haarlemmermeer — jouw gemeente. Maak een groepsfoto. Daarna: elk teamlid noemt één ding dat de gemeente voor haar inwoners doet dat hij/zij het meest waardeert. Stem: welk punt vindt het team het belangrijkst? Leg vast waarom.',
        missionType: 'foto',
        connection: 15, meaning: 20, joy: 10, growth: 15,
        hint1: 'Zoek het Raadhuisplein in het centrum van Hoofddorp',
        hint2: 'Het gemeentehuis is een modern gebouw met grote glazen gevels bij het centrum',
        hint3: 'Raadhuisplein 1 — het grote plein vlakbij het treinstation Hoofddorp',
      },
      {
        order: 1,
        name: 'Plaza Hoofddorp — Hart van de Gemeenschap',
        description: 'Het overdekte winkelcentrum Plaza — ontmoetingsplaats voor alle Hoofddorpenaren',
        type: 'samenwerking',
        lat: 52.3061, lng: 4.6917,   // Plaza winkelcentrum Hoofddorp
        missionTitle: 'Diversiteit in de Polder',
        missionDesc: 'Haarlemmermeer is een van de meest diverse gemeentes van Nederland. Ga in Plaza Hoofddorp op zoek naar tekenen van die diversiteit: andere talen, verschillende winkels, internationale producten. Fotografeer 3 voorbeelden van diversiteit die jullie zien. Bespreek: hoe draagt deze diversiteit bij aan de gemeenschap?',
        missionType: 'foto',
        connection: 20, meaning: 10, joy: 20, growth: 10,
        hint1: 'Loop van het Raadhuisplein richting het winkelcentrum',
        hint2: 'Plaza is het overdekte winkelcentrum in het hart van Hoofddorp',
        hint3: 'Plaza heeft een herkenbare entree met het Plaza-logo — in het midden van het centrum',
      },
      {
        order: 2,
        name: 'Bibliotheek Hoofddorp',
        description: 'De openbare bibliotheek van Hoofddorp — gratis kennis en ontmoeting voor iedereen',
        type: 'reflectie',
        lat: 52.3058, lng: 4.6905,   // Bibliotheek Hoofddorp, centrum
        missionTitle: 'Gelijke Kansen',
        missionDesc: 'De bibliotheek biedt gratis toegang tot boeken, internet en cursussen — ook voor mensen met weinig geld. Ga naar binnen en zoek een boek of materiaal dat aansluit bij het werk van jullie organisatie. Leg het in jullie handen en maak een foto. Bespreek: "Welke kennis zouden wij gratis willen delen met mensen in nood?"',
        missionType: 'foto',
        connection: 10, meaning: 20, joy: 15, growth: 15,
        hint1: 'De bibliotheek ligt vlakbij het centrum en het winkelgebied',
        hint2: 'Zoek het gebouw met de grote ramen en boekenkasten die je van buiten kunt zien',
        hint3: 'De Bibliotheek Hoofddorp is te vinden bij de Hoofdstraat in het centrum',
      },
      {
        order: 3,
        name: 'Supermarkt Inzamelpunt — Actie voor de Voedselbank',
        description: 'Proximiteit van Voedselbank Haarlemmermeer — inzameling van voedsel voor gezinnen in nood (Dirk Storklaan 63A, bereikbaar per auto/fiets)',
        type: 'actie',
        lat: 52.3055, lng: 4.6935,   // Supermarkt/inzamelpunt gebied centrum Hoofddorp
        missionTitle: 'Voedselbank Actie',
        missionDesc: 'De Voedselbank Haarlemmermeer (Dirk Storklaan 63A) helpt honderden gezinnen in nood. Jullie missie: ga naar de dichtstbijzijnde supermarkt en zoek 5 producten die lang houdbaar zijn en die de voedselbank goed kan gebruiken (bijv. pasta, blikgroente, rijst). Fotografeer jullie "donatiepakket" en bereken de totale waarde. Tip: de voedselbank heeft een wishlist op www.voedselbankhaarlemmermeer.nl',
        missionType: 'foto',
        connection: 10, meaning: 25, joy: 10, growth: 15,
        hint1: 'Zoek een supermarkt in het centrum van Hoofddorp',
        hint2: 'Albert Heijn of Jumbo in het centrum zijn goede startpunten',
        hint3: 'De Voedselbank zelf bevindt zich op Dirk Storklaan 63A — te ver voor de tocht, maar op de terugweg langs te rijden!',
      },
      {
        order: 4,
        name: 'Park De Paauw — Eindpunt',
        description: 'Park De Paauw of het groene gebied bij Hoofddorp — rustpunt en feestlocatie',
        type: 'feest',
        lat: 52.3080, lng: 4.6860,   // Groen park/vijver gebied NW van Hoofddorp centrum
        missionTitle: 'Impact Gevierd!',
        missionDesc: 'Jullie hebben Hoofddorp Harten voltooid! Ga in een cirkel staan en doe een "Impact Ronde": elk teamlid geeft de persoon rechts van hem/haar een compliment over hoe zij/hij vandaag impact heeft gemaakt. Film de ronde. Upload jullie overwinningsvideo — jullie zijn klaar voor echte impact!',
        missionType: 'video',
        connection: 25, meaning: 10, joy: 25, growth: 15,
        hint1: 'Loop richting het groen ten noorden van het centrum',
        hint2: 'Park De Paauw of een vijver/park in de buurt van het gemeentehuis',
        hint3: 'Zoek het eerste groene park dat je ziet vanuit het centrum richting het noorden',
      },
    ]

    for (const cp of checkpointsHP) {
      await sql`
        INSERT INTO checkpoints (
          tour_id, order_index, name, description, type,
          latitude, longitude, unlock_radius_meters,
          mission_title, mission_description, mission_type,
          gms_connection, gms_meaning, gms_joy, gms_growth,
          hint1, hint2, hint3, is_kids_friendly
        ) VALUES (
          ${tourHP.id}, ${cp.order}, ${cp.name}, ${cp.description}, ${cp.type},
          ${cp.lat}, ${cp.lng}, 50,
          ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
          ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
          ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, false
        )
      `
      console.log(`  ✓ HP Checkpoint ${cp.order + 1}: ${cp.name} [${cp.lat}, ${cp.lng}]`)
    }

    // ─── Game sessie Hoofddorp ─────────────────────────────────────────────
    const [sessionHP] = await sql`
      INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
      VALUES (${tourHP.id}, ${spelleider.id}, 'lobby', 'HFDORP', 'wijktocht')
      ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
      RETURNING id
    `
    console.log(`\n✓ Sessie aangemaakt (joincode: HFDORP, id: ${sessionHP.id})`)

    // ─── Demo teams Hoofddorp ─────────────────────────────────────────────
    const teamsHP = [
      { name: 'Team Poldermeer',  token: 'token-hp-poldermeer-01' },
      { name: 'Team Schiphol',    token: 'token-hp-schiphol-02' },
      { name: 'Team Haarlemmers', token: 'token-hp-haarlemmers-03' },
    ]
    for (const team of teamsHP) {
      await sql`
        INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
        VALUES (${sessionHP.id}, ${team.name}, ${team.token}, 0)
        ON CONFLICT (team_token) DO NOTHING
      `
      console.log(`  ✓ Team: ${team.name}`)
    }
  }

  // ─── Samenvatting ─────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Haarlemmermeer & Heemstede seed compleet!

📍 TOUR 1: Nieuw-Vennep WijkTocht
   Joincode:  VENNEP
   Route:     Westerkim → Marktplein → Bibliotheek → Buurtcentrum → Park
   Afstand:   ~1.5 km looproute
   Organisaties:
   • Woonzorgcentrum Westerkim (PCSOH), Zaaiersstraat 1
   • Marktplein Nieuw-Vennep (centrum)
   • Bibliotheek De Boekenberg
   • Buurtcentrum Nieuw-Vennep

📍 TOUR 2: Heemstede ImpactSprint
   Joincode:  HEMST
   Route:     Bosbeek → Groenendaal → Binnenweg → WIJ Heemstede → De Glip
   Afstand:   ~1.2 km looproute
   Organisaties:
   • Woonzorgcentrum Bosbeek (Sint Jacob), Glipper Dreef 209
   • Groenendaal-bos (recreatie & natuur)
   • Binnenweg Centrum
   • WIJ Heemstede / Vrijwilligerspunt

📍 TOUR 3: Hoofddorp Harten
   Joincode:  HFDORP
   Route:     Gemeentehuis → Plaza → Bibliotheek → Supermarkt → Park
   Afstand:   ~1.0 km looproute
   Organisaties:
   • Gemeentehuis Haarlemmermeer, Raadhuisplein 1
   • Plaza Hoofddorp (gemeenschapscentrum)
   • Bibliotheek Hoofddorp
   • Voedselbank actie (Dirk Storklaan 63A — tip voor na de tocht)

⚠️  GPS-VERIFICATIE VEREIST:
   Coördinaten zijn nauwkeurig maar kunnen 20-100m afwijken.
   Controleer en pas aan via: Admin → Tour bewerken → Kaarteditor
   Let op: unlock_radius is 50m — zorg dat checkpoints buiten gebouwen liggen.

📱 Testen:
   1. Log in als spelleider@impacttocht.nl
   2. Start sessie met joincode VENNEP / HEMST / HFDORP
   3. Teams joinen via /join
   4. GPS testen op locatie!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
