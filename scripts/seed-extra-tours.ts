/**
 * Seed script: Extra tours — Nieuw-Vennep, Duurzaamheid & Heemstede v2
 *
 * Tour 4: Nieuw-Vennep Verbindingstocht  (joincode: NVPLUS)
 *         Jeugdland → Pier K → MeerWaarde → Voedselbank → Volkstuinen
 *
 * Tour 5: Haarlemmermeer Circulaire Tocht (joincode: CIRCUL)
 *         NMCX → Moestuin Park21 → Repair Café → Straalhoeve → Park21
 *         (fiets-/autotocht, locaties liggen 3-8 km uit elkaar)
 *
 * Tour 6: Heemstede Verbinding (joincode: HEEM2)
 *         Plein1 → WIJ Heemstede → Bosbeek → Groenendaal → Binnenweg
 *         (verbeterd met exacte adressen)
 *
 * Uitvoeren:
 *   bunx tsx scripts/seed-extra-tours.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('\n🌱 Seeding extra tours...\n')

  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Demo Spelleider', 'spelleider@impacttocht.nl', 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  console.log(`✓ Spelleider (id: ${spelleider.id})`)

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUR 4 — Nieuw-Vennep Verbindingstocht
  // Wandelroute ~2.2 km door Nieuw-Vennep
  // Getsewoud → Centrum → West → NS-station buurt
  // ═══════════════════════════════════════════════════════════════════════════
  const [tourNVP] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams, price_in_cents
    ) VALUES (
      'Nieuw-Vennep Verbindingstocht',
      'Van Jeugdland tot de volkstuinen: ontdek de organisaties die Nieuw-Vennep levend houden. Volledig gedraaid door vrijwilligers, voor iedereen in de polder.',
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

  if (!tourNVP) {
    console.log('! Tour "Nieuw-Vennep Verbindingstocht" bestaat al, sla over.')
  } else {
    console.log(`✓ Tour: Nieuw-Vennep Verbindingstocht (id: ${tourNVP.id})`)

    const checkpointsNVP = [
      {
        order: 0,
        name: 'Jeugdland Nieuw-Vennep',
        description: 'Getsewoudweg 2 — bouw-, speel- en ontdekplek volledig gerund door vrijwilligers',
        type: 'kennismaking',
        lat: 52.2718, lng: 4.6435,   // Getsewoudweg 2, wijk Getsewoud
        missionTitle: 'Vrijwilligers in actie',
        missionDesc: 'Jeugdland heeft een kabelbaan, skelters, een huttenbouwdorp én een knutselruimte — alles gebouwd en onderhouden door vrijwilligers. Fotografeer jullie team bij de ingang of het bord. Bespreek: als jouw organisatie één dag dit terrein als vrijwilliger zou "bouwen" — wat zou jullie eerste project zijn? Noem het en leg uit welke impact het heeft op kinderen in de wijk.',
        missionType: 'foto',
        connection: 20, meaning: 15, joy: 20, growth: 10,
        hint1: 'Ga naar de wijk Getsewoud in het noordoosten van Nieuw-Vennep',
        hint2: 'Volg de Getsewoudweg — je ziet de speelattributen al van de straat',
        hint3: 'Getsewoudweg 2 — open op woensdag, vrijdag en zaterdag. Op andere dagen: kijk bij de ingang voor het bord',
      },
      {
        order: 1,
        name: 'Pier K — Cultureel Centrum',
        description: 'Harmonieplein 2 — cultureel en muzikaal hart van Nieuw-Vennep met honderden cursussen per jaar',
        type: 'samenwerking',
        lat: 52.2639, lng: 4.6357,   // Harmonieplein 2, centrum Nieuw-Vennep
        missionTitle: 'Cultuur als verbinder',
        missionDesc: 'Pier K biedt kunst, muziek en theater voor iedereen — van kleuters tot ouderen. Jullie missie: creëer samen een 60-seconden "straatoptreden" op het Harmonieplein. Het mag zijn: een lied, een sketch, een rap over jullie organisatie, of een tableau vivant. Film het op. Durf! Kunst verbindt — ook als het imperfect is.',
        missionType: 'video',
        connection: 15, meaning: 10, joy: 25, growth: 15,
        hint1: 'Loop van Getsewoud richting het centrum van Nieuw-Vennep',
        hint2: 'Het Harmonieplein is het plein met het cultuurgebouw bij de muziekschool',
        hint3: 'Harmonieplein 2 — Pier K heeft een herkenbare gevel met culturele posters en affiches',
      },
      {
        order: 2,
        name: 'MeerWaarde PlusPunt',
        description: 'Venneperhof 30 — inlooppunt voor welzijn, zorg en participatie in Nieuw-Vennep',
        type: 'reflectie',
        lat: 52.2643, lng: 4.6353,   // Venneperhof 30, winkelcentrum NV
        missionTitle: 'Wie heeft hulp nodig?',
        missionDesc: 'MeerWaarde ondersteunt mensen die het even niet alleen redden — van geldzorgen tot eenzaamheid. Hun motto: "Zelf, samen, sterker." Sta 5 minuten stil bij deze vraag als team: "In onze eigen werkomgeving, wie vraagt misschien nooit om hulp maar heeft het soms hard nodig?" Schrijf 3 typen mensen op — en wat jullie concreet voor hen kunnen doen.',
        missionType: 'opdracht',
        connection: 10, meaning: 25, joy: 5, growth: 15,
        hint1: 'Venneperhof is het winkelcentrum/plein in het hart van Nieuw-Vennep',
        hint2: 'MeerWaarde PlusPunt zit naast de winkels — zoek het sociale informatieloket',
        hint3: 'Venneperhof 30 — als je het winkelcentrum ingaat, zoek dan de MeerWaarde balie of bord',
      },
      {
        order: 3,
        name: 'Voedselbank Uitdeel — De Rank',
        description: 'Eugenie Previnaireweg 14 — uitdeeladres van de Voedselbank Haarlemmermeer bij Protestantse Kerk De Rank',
        type: 'actie',
        lat: 52.2668, lng: 4.6312,   // Eugenie Previnaireweg 14, west NV
        missionTitle: 'Drempel verlagen',
        missionDesc: 'Elke week halen hier tientallen gezinnen in Nieuw-Vennep een voedselpakket op. Volledig gerund door vrijwilligers. Bedenk als team een concrete "drempelverlagende" actie: hoe zou jouw organisatie het voor mensen makkelijker maken om hulp te vragen of te accepteren? Schrijf een mini-plan (5 regels) en één persoon presenteert het aan de groep.',
        missionType: 'opdracht',
        connection: 10, meaning: 25, joy: 5, growth: 20,
        hint1: 'Loop richting het westen van het centrum, richting de Eugenie Previnaireweg',
        hint2: 'Zoek de Protestantse Kerk De Rank — de voedselbank deelt hier uit',
        hint3: 'Eugenie Previnaireweg 14 — het uitdeeladres is bij de kerk, niet de hoofdlocatie in Hoofddorp',
      },
      {
        order: 4,
        name: 'Volkstuinvereniging Nieuw-Vennep',
        description: 'Hoek Oosterdreef / Venneperweg — 122 volkstuinen bij het NS-station, sociale cohesie door samen tuinieren',
        type: 'feest',
        lat: 52.2548, lng: 4.6382,   // Volkstuinen bij NS-station NV, Oosterdreef/Venneperweg
        missionTitle: 'Samen Groeien!',
        missionDesc: 'Gefeliciteerd — jullie hebben de Verbindingstocht voltooid! De volkstuinen symboliseren alles wat jullie vandaag gezien hebben: mensen die samen iets opbouwen, voor zichzelf én de gemeenschap. Fotografeer jullie team bij de tuinen of het hek. Elke persoon zegt hardop: "Eén ding dat ik vandaag ga veranderen in hoe ik bijdraag aan mijn gemeenschap is..." Film de ronde!',
        missionType: 'video',
        connection: 25, meaning: 20, joy: 20, growth: 15,
        hint1: 'Loop richting het NS-station Nieuw-Vennep aan de zuidkant',
        hint2: 'De volkstuinen liggen bij de kruising Oosterdreef en Venneperweg',
        hint3: 'Volkstuin Nieuw-Vennep is zichtbaar vanaf de straat — groen perceel met tuinhekjes naast het spoor',
      },
    ]

    for (const cp of checkpointsNVP) {
      await sql`
        INSERT INTO checkpoints (
          tour_id, order_index, name, description, type,
          latitude, longitude, unlock_radius_meters,
          mission_title, mission_description, mission_type,
          gms_connection, gms_meaning, gms_joy, gms_growth,
          hint1, hint2, hint3, is_kids_friendly
        ) VALUES (
          ${tourNVP.id}, ${cp.order}, ${cp.name}, ${cp.description}, ${cp.type},
          ${cp.lat}, ${cp.lng}, 50,
          ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
          ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
          ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, false
        )
      `
      console.log(`  ✓ NVP Checkpoint ${cp.order + 1}: ${cp.name}`)
    }

    const [sessionNVP] = await sql`
      INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
      VALUES (${tourNVP.id}, ${spelleider.id}, 'lobby', 'NVPLUS', 'wijktocht')
      ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
      RETURNING id
    `
    console.log(`✓ Sessie NVPLUS (id: ${sessionNVP.id})`)

    for (const team of [
      { name: 'Team Jeugdland',   token: 'token-nvp-jeugdland-01' },
      { name: 'Team Pier K',      token: 'token-nvp-pierk-02' },
      { name: 'Team Volkstuinen', token: 'token-nvp-volkstuin-03' },
    ]) {
      await sql`
        INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
        VALUES (${sessionNVP.id}, ${team.name}, ${team.token}, 0)
        ON CONFLICT (team_token) DO NOTHING
      `
      console.log(`  ✓ Team: ${team.name}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUR 5 — Haarlemmermeer Circulaire Tocht
  // Fiets-/autotocht langs duurzaamheidslocaties in Haarlemmermeer
  // Afstand: ~15 km (fietsen aanbevolen), geschikt voor 2-3 uur
  // Route: NMCX Hoofddorp → Moestuin Park21 → Repair Café → Straalhoeve → Park21
  // ═══════════════════════════════════════════════════════════════════════════
  const [tourCRC] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams, price_in_cents
    ) VALUES (
      'Haarlemmermeer Circulaire Tocht',
      'Per fiets door de duurzaamste plekken van Haarlemmermeer. Van het duurzaamheidscentrum NMCX tot een zorgboerderij in de polder — ontdek hoe de polder koploper wordt in circulaire economie. 🚲 Fietsen aanbevolen.',
      'wijktocht',
      ${spelleider.id},
      true,
      180,
      8,
      0
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tourCRC) {
    console.log('! Tour "Haarlemmermeer Circulaire Tocht" bestaat al, sla over.')
  } else {
    console.log(`\n✓ Tour: Haarlemmermeer Circulaire Tocht (id: ${tourCRC.id})`)

    const checkpointsCRC = [
      {
        order: 0,
        name: 'NMCX — Centrum voor Duurzaamheid',
        description: 'Dreamstreet 12, Hoofddorp — kennis- en informatiecentrum voor duurzaamheid in Haarlemmermeer',
        type: 'kennismaking',
        lat: 52.3112, lng: 4.6975,   // Dreamstreet 12, Beukenhorst Hoofddorp
        missionTitle: 'Duurzaamheidsscan',
        missionDesc: 'NMCX is het duurzaamheidscentrum van Haarlemmermeer — ze coördineren Repair Cafés, NME-activiteiten bij Jeugdland, en verduurzamingsprojecten. Fotografeer jullie team bij de ingang. Daarna: doe als team een snelle "duurzaamheidsscan" van jullie eigen organisatie — geef een cijfer 1-10 voor: (a) energiegebruik, (b) afval, (c) mobiliteit, (d) inkoop. Wat is jullie zwakste punt? Wat pakken jullie als eerste aan?',
        missionType: 'foto',
        connection: 10, meaning: 20, joy: 10, growth: 25,
        hint1: 'NMCX ligt in het bedrijventerrein Beukenhorst in Hoofddorp',
        hint2: 'Dreamstreet 12 — zoek het groene gebouw of de duurzaamheidsborden bij de ingang',
        hint3: 'NMCX is gevestigd in een omgebouwde gymzaal bij de Prins Hendriklaan in Beukenhorst',
      },
      {
        order: 1,
        name: 'Moestuin Park21',
        description: 'IJweg 1336, Nieuw-Vennep — gemeenschappelijke moestuin op het Park21-terrein, sociale cohesie door biologisch tuinieren',
        type: 'samenwerking',
        lat: 52.2895, lng: 4.6880,   // IJweg 1336, Park21 gebied
        missionTitle: 'Van zaad tot tafel',
        missionDesc: 'Moestuin Park21 begon als tijdelijk project en groeide uit tot een bloeiende vereniging. Samen tuinieren = samen eten = verbinding. Jullie missie: zoek 3 eetbare planten of groenten op het terrein (of in de omgeving). Fotografeer ze. Bedenk samen een "Van de moestuin naar de werkvloer"-concept: hoe zou een moestuin op of bij jullie kantoor werken? Wie doet wat? Wat voor impact heeft het?',
        missionType: 'foto',
        connection: 20, meaning: 15, joy: 20, growth: 10,
        hint1: 'Fiets via de IJweg richting Park21 — het recreatiegebied tussen Hoofddorp en Nieuw-Vennep',
        hint2: 'De moestuin ligt achter Ranzijn Tuin & Dier op IJweg 1336',
        hint3: 'IJweg 1336 — zoek de moestuinpercelen en het verenigingsbord bij de ingang van Park21',
      },
      {
        order: 2,
        name: 'Repair Café De Ark',
        description: 'Muiderbos 36, Hoofddorp — elke 3e woensdag van de maand: kapotte spullen gratis gerepareerd door vrijwilligers',
        type: 'reflectie',
        lat: 52.3038, lng: 4.6972,   // Muiderbos 36, woonwijk Hoofddorp
        missionTitle: 'Circulaire mindset',
        missionDesc: 'Het Repair Café is een statement: wij gooien niet weg, wij repareren. Vrijwilligers met gereedschap en kennis maken kapotte dingen weer heel. Sta voor het gebouw. Elk teamlid noemt één "gebroken" of "verouderd" iets in jullie organisatie dat gerepareerd of vernieuwd kan worden — niet per se een apparaat, ook een proces, een gewoonte, een relatie. Hoe repareer je dat samen?',
        missionType: 'opdracht',
        connection: 10, meaning: 20, joy: 15, growth: 20,
        hint1: 'Muiderbos is een woonwijk in het oosten van Hoofddorp',
        hint2: 'De Ark is een gebouw/gemeenschapsruimte aan Muiderbos 36',
        hint3: 'Zoek het gemeenschapsgebouw of kerkgebouw aan Muiderbos 36 — het Repair Café is hier elke 3e woensdag',
      },
      {
        order: 3,
        name: 'Zorgboerderij De Straalhoeve',
        description: 'Vijfhuizerdijk 231, Vijfhuizen — dagbesteding in de natuur voor mensen met psychische klachten, verbonden aan Stichting Landzijde',
        type: 'actie',
        lat: 52.3378, lng: 4.6758,   // Vijfhuizerdijk 231, Vijfhuizen
        missionTitle: 'Natuur als medicijn',
        missionDesc: 'De Straalhoeve biedt dagbesteding aan mensen met psychische kwetsbaarheid of hersenletsel — ze werken met dieren en op het land. Natuur als therapie. Observeer de omgeving: hoe voelt het hier, vergeleken met een kantooromgeving? Schrijf als team 5 dingen die je ziet/hoort/ruikt. Daarna: hoe zou jouw organisatie meer "natuur" kunnen integreren in het dagelijks werk? (bijv. vergaderen buiten, planten, wandelen)',
        missionType: 'opdracht',
        connection: 15, meaning: 25, joy: 15, growth: 10,
        hint1: 'Fiets richting Vijfhuizen ten noorden van Hoofddorp',
        hint2: 'De Vijfhuizerdijk is een polderweg in Vijfhuizen — zoek de boerderij met dieren',
        hint3: 'Vijfhuizerdijk 231 — de Straalhoeve is een werkende boerderij, open op maandag en vrijdag',
      },
      {
        order: 4,
        name: 'Park21 — Eindpunt Groene Polder',
        description: 'Park21, Haarlemmermeer — 1.000 hectare recreatie en natuur tussen Hoofddorp en Nieuw-Vennep, duurzaamste publieke project van de gemeente',
        type: 'feest',
        lat: 52.2950, lng: 4.6820,   // Park21 centraal gebied
        missionTitle: 'Circulaire Champions!',
        missionDesc: 'Jullie hebben de circulaire polder van Haarlemmermeer doorkruist! Park21 is het symbool van een toekomstgericht Haarlemmermeer: natuur, sport, voedsel en gemeenschap op 1.000 hectare. Maak een groepsfoto in het park. Elk teamlid noemt hun "circulaire belofte": één concrete gewoonte die zij veranderen na vandaag. Film ze allemaal. Kom op — de polder kijkt toe!',
        missionType: 'video',
        connection: 20, meaning: 15, joy: 25, growth: 15,
        hint1: 'Park21 ligt tussen Hoofddorp en Nieuw-Vennep, bereikbaar via de IJweg of de A4/A9',
        hint2: 'Zoek een mooi open stuk groen of de vijver in Park21',
        hint3: 'Het park heeft informatieborden en wandelpaden — kies een plek met uitzicht over de polder',
      },
    ]

    for (const cp of checkpointsCRC) {
      await sql`
        INSERT INTO checkpoints (
          tour_id, order_index, name, description, type,
          latitude, longitude, unlock_radius_meters,
          mission_title, mission_description, mission_type,
          gms_connection, gms_meaning, gms_joy, gms_growth,
          hint1, hint2, hint3, is_kids_friendly
        ) VALUES (
          ${tourCRC.id}, ${cp.order}, ${cp.name}, ${cp.description}, ${cp.type},
          ${cp.lat}, ${cp.lng}, 75,
          ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
          ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
          ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, false
        )
      `
      console.log(`  ✓ CRC Checkpoint ${cp.order + 1}: ${cp.name}`)
    }

    // unlock_radius 75m voor fiets-checkpoints (je fietst er langs)

    const [sessionCRC] = await sql`
      INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
      VALUES (${tourCRC.id}, ${spelleider.id}, 'lobby', 'CIRCUL', 'wijktocht')
      ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
      RETURNING id
    `
    console.log(`✓ Sessie CIRCUL (id: ${sessionCRC.id})`)

    for (const team of [
      { name: 'Team NMCX',       token: 'token-crc-nmcx-01' },
      { name: 'Team Moestuin',   token: 'token-crc-moestuin-02' },
      { name: 'Team Straalhoeve', token: 'token-crc-straalhoeve-03' },
    ]) {
      await sql`
        INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
        VALUES (${sessionCRC.id}, ${team.name}, ${team.token}, 0)
        ON CONFLICT (team_token) DO NOTHING
      `
      console.log(`  ✓ Team: ${team.name}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUR 6 — Heemstede Verbinding (verbeterd — exacte adressen)
  // Route: Plein1 → WIJ Heemstede → Bosbeek → Groenendaal → Herenweg centrum
  // Wandelafstand: ~2.0 km, 90-120 min
  // ═══════════════════════════════════════════════════════════════════════════
  const [tourH2] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams, price_in_cents
    ) VALUES (
      'Heemstede Verbinding',
      'Van Plein1 tot het Groenendaal-bos: ontdek het sociale weefsel van Heemstede. Vrijwilligers, mantelzorgers en professionals die samen zorgen dat niemand buiten de boot valt.',
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

  if (!tourH2) {
    console.log('! Tour "Heemstede Verbinding" bestaat al, sla over.')
  } else {
    console.log(`\n✓ Tour: Heemstede Verbinding (id: ${tourH2.id})`)

    const checkpointsH2 = [
      {
        order: 0,
        name: 'Plein1 — Huiskamer van Heemstede',
        description: 'Julianaplein 1 — multifunctioneel hart van Heemstede: WIJ, bibliotheek, kinderopvang, zorg en ontmoeting onder één dak',
        type: 'kennismaking',
        lat: 52.3498, lng: 4.6168,   // Julianaplein 1, centrum Heemstede
        missionTitle: 'Één dak, één gemeenschap',
        missionDesc: 'Plein1 huisvest WIJ Heemstede, Kennemerhart (zorg), de Bibliotheek, kinderopvang Op Stoom, en meerdere zorginstellingen — alles op één plek. Kijk door de ramen of loop naar binnen. Fotografeer het bord of de ingang. Bespreek als team: wat zou er in jouw organisatie veranderen als jullie meer samenwerking "onder één dak" zouden zoeken met andere maatschappelijke partijen?',
        missionType: 'foto',
        connection: 15, meaning: 20, joy: 10, growth: 20,
        hint1: 'Plein1 ligt op het Julianaplein in het centrum van Heemstede',
        hint2: 'Het is een modern gebouw met grote glazen puien — open van maandag t/m zondag 08:30-17:30',
        hint3: 'Julianaplein 1 — vlak bij de Binnenweg, het hoofdwinkelgebied van Heemstede',
      },
      {
        order: 1,
        name: 'WIJ Heemstede',
        description: 'Herenweg 96 — welzijnsorganisatie voor álle Heemstedenaren: maatschappelijk werk, jeugdwerk, ouderenactiviteiten en statushoudersbegeleiding',
        type: 'reflectie',
        lat: 52.3558, lng: 4.6228,   // Herenweg 96, Heemstede
        missionTitle: 'Wie vangt wie op?',
        missionDesc: 'WIJ Heemstede begeleidt statushouders, jongeren, ouderen en mensen in crisis — maar ook vrijwilligers die anderen willen helpen. Sta voor het pand. Elk teamlid beantwoordt: "Ik heb ooit hulp ontvangen van..." en "Ik heb ooit hulp gegeven aan..." Wat valt op? Hoe vaak geven en ontvangen jullie in het team — en in jullie organisatie? Noteer de balans.',
        missionType: 'opdracht',
        connection: 15, meaning: 25, joy: 10, growth: 10,
        hint1: 'Loop van Plein1 richting het noorden langs de Herenweg',
        hint2: 'De Herenweg is de doorgaande weg door Heemstede — WIJ is in een herkenbaar pand',
        hint3: 'Herenweg 96 — ook het theater Podia Heemstede zit in hetzelfde complex',
      },
      {
        order: 2,
        name: 'Bosbeek Woonzorgcentrum',
        description: 'Glipper Dreef 209 — woonzorgcentrum Sint Jacob op een prachtig landgoed, ~160 bewoners, vrijwilligers welkom',
        type: 'samenwerking',
        lat: 52.3473, lng: 4.6134,   // Glipper Dreef 209, Heemstede
        missionTitle: 'Ogen van een bewoner',
        missionDesc: 'Bosbeek ligt op een mooi landgoed naast het Groenendaal-bos. Stel je voor: je bent 83 jaar, je woont hier al 3 jaar, en vandaag komt een groep bezoekers langs. Wat zou je ze willen vragen? Wat zou je willen laten zien of vertellen? Elk teamlid schrijft 1 vraag op vanuit het perspectief van een bewoner. Lees ze voor en bespreek: wat zegt dit over eenzaamheid en verbinding?',
        missionType: 'opdracht',
        connection: 20, meaning: 25, joy: 10, growth: 10,
        hint1: 'Loop van de Herenweg richting het zuiden en zoek de Glipper Dreef',
        hint2: 'Bosbeek heeft een lange oprijlaan met bomen — je ziet het landgoed vanuit de straat',
        hint3: 'Glipper Dreef 209 — het woonzorgcentrum van Sint Jacob, direct naast het Groenendaal-bos',
      },
      {
        order: 3,
        name: 'Groenendaal Bos',
        description: 'Bosrand Groenendaal, Heemstede — wandelbos direct naast Bosbeek, natuur als gemeengoed voor alle Heemstedenaren',
        type: 'actie',
        lat: 52.3481, lng: 4.6094,   // Bosrand Groenendaal
        missionTitle: 'Belofte aan het bos',
        missionDesc: 'Ga het bos in voor precies 4 minuten. Loop in stilte. Richt je bewust op wat je ziet, hoort en voelt. Kom dan terug en schrijf als team in 3 zinnen op: "Wij beloven als organisatie om..." — een concrete duurzame of sociale belofte. Houd die belofte bij en neem hem mee terug naar kantoor.',
        missionType: 'opdracht',
        connection: 10, meaning: 20, joy: 20, growth: 15,
        hint1: 'Het Groenendaal-bos begint direct achter Bosbeek',
        hint2: 'Volg het bospad vanuit de oprijlaan van Bosbeek richting het groen',
        hint3: 'Zoek de bosrand en een open plek of bankje om de reflectie te doen',
      },
      {
        order: 4,
        name: 'Binnenweg — Eindpunt Heemstede',
        description: 'Binnenweg, centrum Heemstede — gezellige winkelstraat als symbool van een levende, verbonden gemeenschap',
        type: 'feest',
        lat: 52.3496, lng: 4.6165,   // Binnenweg centrum Heemstede
        missionTitle: 'Heemstede Verbinding — Voltooid!',
        missionDesc: 'Jullie hebben Heemstede van Plein1 tot het Groenendaal doorkruist. Ga zitten op een terrasje of bankje aan de Binnenweg. Laat elk teamlid in één zin zeggen: "De organisatie in Heemstede die mij het meeste heeft geraakt vandaag was... omdat..." Maak een groepsselfie als afsluiting. Wat nemen jullie mee terug naar kantoor?',
        missionType: 'foto',
        connection: 25, meaning: 15, joy: 20, growth: 15,
        hint1: 'Loop van het bos terug richting het centrum via de Glipper Dreef',
        hint2: 'De Binnenweg is het verlengde van de Glipperweg — de centrale winkelstraat',
        hint3: 'Zoek de terrassen en winkels aan de Binnenweg in het hart van Heemstede',
      },
    ]

    for (const cp of checkpointsH2) {
      await sql`
        INSERT INTO checkpoints (
          tour_id, order_index, name, description, type,
          latitude, longitude, unlock_radius_meters,
          mission_title, mission_description, mission_type,
          gms_connection, gms_meaning, gms_joy, gms_growth,
          hint1, hint2, hint3, is_kids_friendly
        ) VALUES (
          ${tourH2.id}, ${cp.order}, ${cp.name}, ${cp.description}, ${cp.type},
          ${cp.lat}, ${cp.lng}, 50,
          ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
          ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
          ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, false
        )
      `
      console.log(`  ✓ H2 Checkpoint ${cp.order + 1}: ${cp.name}`)
    }

    const [sessionH2] = await sql`
      INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
      VALUES (${tourH2.id}, ${spelleider.id}, 'lobby', 'HEEM2', 'impactsprint')
      ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
      RETURNING id
    `
    console.log(`✓ Sessie HEEM2 (id: ${sessionH2.id})`)

    for (const team of [
      { name: 'Team Plein1',      token: 'token-h2-plein1-01' },
      { name: 'Team Bosbeek',     token: 'token-h2-bosbeek-02' },
      { name: 'Team Groenendaal', token: 'token-h2-groenendaal-03' },
    ]) {
      await sql`
        INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
        VALUES (${sessionH2.id}, ${team.name}, ${team.token}, 0)
        ON CONFLICT (team_token) DO NOTHING
      `
      console.log(`  ✓ Team: ${team.name}`)
    }
  }

  // ─── Samenvatting ─────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Extra tours seed compleet!

📍 TOUR 4: Nieuw-Vennep Verbindingstocht
   Joincode:  NVPLUS
   Formaat:   WijkTocht, ~2.2 km, 120 min
   Route:     Jeugdland → Pier K → MeerWaarde → Voedselbank → Volkstuinen
   Organisaties:
   • Jeugdland (Getsewoudweg 2) — volledig vrijwilligers, kinderen, NME
   • Pier K (Harmonieplein 2) — cultuur, muziek, honderden cursussen
   • MeerWaarde PlusPunt (Venneperhof 30) — welzijn, armoede, participatie
   • Voedselbank uitdeel (Eugenie Previnaireweg 14) — bij Kerk De Rank
   • Volkstuinvereniging (Oosterdreef/Venneperweg) — 122 tuinen bij NS-station

📍 TOUR 5: Haarlemmermeer Circulaire Tocht
   Joincode:  CIRCUL
   Formaat:   WijkTocht 🚲 (fietsen!), ~15 km, 180 min
   Route:     NMCX → Moestuin Park21 → Repair Café → Straalhoeve → Park21
   Organisaties:
   • NMCX (Dreamstreet 12, Hfdorp) — duurzaamheidscentrum
   • Moestuin Park21 (IJweg 1336) — gemeenschappelijk tuinieren
   • Repair Café De Ark (Muiderbos 36, Hfdorp) — circulair, vrijwilligers
   • Zorgboerderij Straalhoeve (Vijfhuizerdijk 231, Vijfhuizen) — zorg+natuur
   • Park21 — eindpunt in het polderpark
   ⚠️  unlock_radius: 75m (fietsen → grotere tolerantie)

📍 TOUR 6: Heemstede Verbinding
   Joincode:  HEEM2
   Formaat:   ImpactSprint, ~2.0 km, 90 min
   Route:     Plein1 → WIJ Heemstede → Bosbeek → Groenendaal → Binnenweg
   Organisaties:
   • Plein1 (Julianaplein 1) — community hub van Heemstede
   • WIJ Heemstede (Herenweg 96) — welzijn, jeugd, statushouders
   • Bosbeek Sint Jacob (Glipper Dreef 209) — woonzorgcentrum
   • Groenendaal-bos — natuur als gemeengoed
   • Binnenweg — centrum en eindpunt

⚠️  GPS-verificatie via Admin → Kaarteditor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
