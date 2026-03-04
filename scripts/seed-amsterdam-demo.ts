/**
 * Seed script: Amsterdam ImpactTocht — Demo voor homepage screenshots
 *
 * Maakt aan:
 *   - 1 tour: "Amsterdam Impact Wandeling" (WijkTocht, 5 checkpoints)
 *   - 1 voltooide sessie (status: completed)
 *   - 4 teams, 22 deelnemers totaal
 *   - Alle submissions + session_scores (realistische GMS data)
 *
 * Uitvoeren:
 *   bunx tsx scripts/seed-amsterdam-demo.ts [email]
 *
 *   email = spelleider e-mail (default: demo@impacttocht.nl)
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const EMAIL = process.argv[2] ?? 'chat@weareimpact.nl'

// ─── Checkpoint definities ─────────────────────────────────────────────────
// Route: Begijnhof → Nieuwmarkt → Waterlooplein → Hortus Botanicus → Oosterpark
// Afstand: ~3.5 km, 90-120 min wandeling

const CHECKPOINTS = [
  {
    order: 0,
    name: 'Begijnhof — Verborgen Oase',
    description:
      'Het Begijnhof, Amsterdam — een van de oudste hofjes van Europa, ooit thuis voor zelfstandige vrouwen die voor zieken en armen zorgden',
    type: 'kennismaking',
    lat: 52.3703, lng: 4.8888,
    missionTitle: 'De kracht van gemeenschap',
    missionDesc:
      'Het Begijnhof bestond al in de 14e eeuw — een plek waar vrouwen zelfstandig konden leven én zorgden voor de kwetsbare mensen in de stad. Maak een foto van jullie team in de binnenplaats. Bespreek: "Als wij als team een hofje zouden stichten, welke missie zou dat hebben?" Schrijf jullie teamsmissie op in één zin.',
    missionType: 'foto',
    connection: 25, meaning: 25, joy: 15, growth: 15, // max 80
    hint1: 'Loop via de Kalverstraat, zoek de doorgang bij Begijnhof 30',
    hint2: 'Het Begijnhof heeft een verborgen ingang via de Gedempte Begijnensloot naast de Kalverstraat',
    hint3: 'De ingang zit direct naast het Amsterdam Museum — kleine houten deur, je zou hem zo voorbij lopen',
  },
  {
    order: 1,
    name: 'Nieuwmarkt — Bruisend Plein',
    description:
      'Nieuwmarkt met de Waag (1488) — historische weegplaats, nu omgeven door een diverse buurt vol culturen en verhalen',
    type: 'samenwerking',
    lat: 52.3731, lng: 4.9001,
    missionTitle: 'Diversiteit als kracht',
    missionDesc:
      'De Waag op Nieuwmarkt was ooit de plek waar goederen gewogen werden — eerlijk handelen voor iedereen. Vandaag is Nieuwmarkt een van de meest diverse pleinen van Amsterdam. Jullie opdracht: interview 3 verschillende mensen op het plein (van verschillende leeftijden of achtergronden). Vraag: "Wat betekent Amsterdam voor jou?" Noteer de 3 beste antwoorden en kies het antwoord dat jullie het meest verraste.',
    missionType: 'opdracht',
    connection: 20, meaning: 20, joy: 20, growth: 15, // max 75
    hint1: 'Loop via de Kloveniersburgwal richting het noorden',
    hint2: 'Nieuwmarkt ligt aan het einde van de Zeedijk — volg de tramrails',
    hint3: 'De Waag is het grote middeleeuwse gebouw in het midden van het plein — je kunt het niet missen',
  },
  {
    order: 2,
    name: 'Waterlooplein — Markt van Verhalen',
    description:
      'Waterlooplein vlooienmarkt — de oudste markt van Amsterdam, ooit het hart van de Joodse buurt',
    type: 'reflectie',
    lat: 52.3664, lng: 4.9007,
    missionTitle: 'Tweede kansen',
    missionDesc:
      'Op de Waterlooplein vlooienmarkt krijgen spullen een tweede leven — circulaire economie avant la lettre. Loop samen over de markt en zoek een object dat een verhaal vertelt (een oud boek, een vintage item, een kledingstuk). Fotografeer het object. Bedenk samen: welk verhaal vertelt dit object? En: hoe geeft jullie organisatie mensen of ideeën een "tweede kans"?',
    missionType: 'foto',
    connection: 15, meaning: 25, joy: 20, growth: 15, // max 75
    hint1: 'Loop vanaf Nieuwmarkt via de Sint Antoniesbreestraat richting het zuiden',
    hint2: 'Waterlooplein ligt naast het Muziektheater (het "Stopera") aan de Amstel',
    hint3: 'Je hoort de markt al voor je hem ziet — volg de kramen en het geluid van de markt',
  },
  {
    order: 3,
    name: 'Hortus Botanicus — Groene Stilte',
    description:
      'Hortus Botanicus Amsterdam (1638) — een van de oudste botanische tuinen ter wereld, plek voor rust en verwondering',
    type: 'actie',
    lat: 52.3664, lng: 4.9072,
    missionTitle: 'Groeien in stilte',
    missionDesc:
      'De Hortus Botanicus bestaat al bijna 400 jaar — planten van over de hele wereld, verzameld met nieuwsgierigheid en zorg. Ga bij de ingang staan. Elk teamlid schrijft op: "Welke vaardigheid of eigenschap van mezelf wil ik laten groeien dit jaar?" Deel dit met het team. Fotografeer jullie "groei-kaartjes" samen. Bonuspunten als jullie een plant fotograferen die past bij jouw groeiwens!',
    missionType: 'foto',
    connection: 15, meaning: 20, joy: 20, growth: 25, // max 80
    hint1: 'Loop via de Nieuwe Herengracht richting het oosten',
    hint2: 'Hortus Botanicus ligt aan het Plantage Middenlaan — volg de borden',
    hint3: 'De ingang is aan het Plantage Middenlaan 2a — je ziet de oude serre door het hek',
  },
  {
    order: 4,
    name: 'Oosterpark — Impact Gevierd!',
    description:
      'Oosterpark — het oudste gemeentelijke park van Amsterdam, thuis voor festivals, Dappermarkt en de multiculturele Oost-buurt',
    type: 'feest',
    lat: 52.3603, lng: 4.9195,
    missionTitle: 'Impact Ronde — Jullie Kracht',
    missionDesc:
      'Jullie hebben Amsterdam Impact Wandeling voltooid! Ga in een cirkel staan in het Oosterpark. Doe een Impact Ronde: elk teamlid wijst de persoon links van hem/haar aan en zegt: "[Naam] heeft vandaag impact gemaakt door..." Film de ronde (30 seconden). Upload de video als afsluiting. Jullie collectieve impact: hoeveel mensen hebben jullie vandaag gesproken, geïnterviewd of bereikt? Tel het op — dat is jullie bereik!',
    missionType: 'video',
    connection: 25, meaning: 15, joy: 25, growth: 10, // max 75
    hint1: 'Loop via de Plantage Kerklaan richting het zuiden, dan rechts de Linnaeusstraat in',
    hint2: 'Oosterpark heeft een grote vijver in het midden — volg de Eerste Oosterparkstraat',
    hint3: 'De ingang van Oosterpark is aan de Mauritskade of de Eerste Oosterparkstraat — zoek het hek met de parkname',
  },
]

// Totale GMS max = 80 + 75 + 75 + 80 + 75 = 385

// ─── Team score matrix ─────────────────────────────────────────────────────
// Per team, per checkpoint: [connection, meaning, joy, growth]
// (gmsEarned = som van deze 4)

type TeamDef = {
  name: string
  token: string
  members: number
  scores: [number, number, number, number][] // per checkpoint
}

const TEAMS: TeamDef[] = [
  {
    name: 'Team Jordaan',
    token: 'token-ams-jordaan-01',
    members: 6,
    scores: [
      // CP0 max 80: [25,25,15,15]
      [23, 24, 14, 14],  // earned=75
      // CP1 max 75: [20,20,20,15]
      [19, 18, 18, 13],  // earned=68
      // CP2 max 75: [15,25,20,15]
      [14, 23, 18, 13],  // earned=68
      // CP3 max 80: [15,20,20,25]
      [14, 18, 18, 23],  // earned=73
      // CP4 max 75: [25,15,25,10]
      [23, 13, 23, 9],   // earned=68
    ],
    // Total: connection=93, meaning=96, joy=91, growth=72, gms=352
  },
  {
    name: 'Team De Pijp',
    token: 'token-ams-depijp-02',
    members: 5,
    scores: [
      [20, 21, 12, 12],  // earned=65
      [16, 16, 16, 11],  // earned=59
      [12, 20, 16, 12],  // earned=60
      [12, 16, 16, 20],  // earned=64
      [20, 11, 20, 8],   // earned=59
    ],
    // Total: connection=80, meaning=84, joy=80, growth=63, gms=307
  },
  {
    name: 'Team Amstel',
    token: 'token-ams-amstel-03',
    members: 5,
    scores: [
      [17, 18, 10, 10],  // earned=55
      [13, 13, 13, 10],  // earned=49
      [10, 17, 13, 10],  // earned=50
      [10, 13, 13, 17],  // earned=53
      [17, 9,  17, 7],   // earned=50
    ],
    // Total: connection=67, meaning=70, joy=66, growth=54, gms=257
  },
  {
    name: 'Team Noord',
    token: 'token-ams-noord-04',
    members: 6,
    scores: [
      [14, 15, 8,  8],   // earned=45
      [10, 10, 10, 8],   // earned=38
      [8,  14, 10, 8],   // earned=40
      [8,  10, 10, 14],  // earned=42
      [14, 7,  14, 5],   // earned=40
    ],
    // Total: connection=54, meaning=56, joy=52, growth=43, gms=205
  },
]

// ─── Coach insights (vooraf gegenereerd, gecached) ─────────────────────────

const COACH_INSIGHTS: Record<string, string> = {
  'Team Jordaan':
    'Team Jordaan heeft een uitzonderlijke prestatie geleverd tijdens de Amsterdam Impact Wandeling! Jullie topscore op Betekenis toont aan hoe diepgaand jullie elke ontmoeting en opdracht hebben verwerkt. Het gesprek bij het Begijnhof en de marktinterviews op Nieuwmarkt zorgden voor echte verbinding met de stad en haar bewoners. Jullie groeiscore geeft aan dat dit meer was dan een uitje — het was een echte ontwikkelervaring. Neem de teamsmissie die jullie formuleerden mee terug naar kantoor: die ene zin kan de basis zijn voor jullie volgende impactinitiatief.',
  'Team De Pijp':
    'Team De Pijp heeft indrukwekkend samengewerkt! Jullie constante scores over alle checkpoints laten zien dat jullie als team in balans zijn — niemand haalt de rest naar beneden, iedereen tilt de ander omhoog. De verbindingsscore bij het Oosterpark was het hoogtepunt: jullie Impact Ronde was gevuld met echte complimenten. Gebruik die energie terug op de werkvloer. Tip: plan een maandelijkse "Impact Ronde" in jullie teamoverleg — het duurt 5 minuten en versterkt de teamcultuur enorm.',
  'Team Amstel':
    'Team Amstel heeft een solide tocht gelopen met mooie momenten van reflectie en verbinding. Jullie beste score zat bij de Hortus Botanicus — de groei-oefening raakte jullie duidelijk. De groeimindset die jullie daar toonden is precies wat teams in beweging zet. Voor de volgende keer: durf meer diepgang te zoeken bij de interviews op straat. Jullie zijn verder dan jullie denken — de stap van 65% naar 75% zit in één ding: nóg één eerlijk gesprek met een vreemde.',
  'Team Noord':
    'Team Noord heeft lef getoond! Een nieuwe stad verkennen met een team dat misschien nog niet zo lang samenwerkt, vraagt moed. Jullie score bij de Waterlooplein-opdracht laat zien dat jullie de kern begrijpen van wat impact betekent: aandacht geven aan wat anderen weggooien. Dat perspectief is waardevol. Investeer als team in meer gemeenschappelijke ervaringen buiten kantoor — jullie potentie is groter dan de score doet vermoeden. De Hoge Impact Badge komt de volgende keer!',
}

// ─── Antwoorden per checkpoint (realistisch, voor de submissions) ──────────

const ANSWERS: Record<string, string[]> = {
  'Team Jordaan': [
    'Onze teamsmissie: "Wij verbinden mensen die iets te geven hebben met mensen die iets nodig hebben." — gevonden in dit hofje van 650 jaar oud. Als ons bedrijf een hofje stichtte, zou de missie zijn: gratis kennis delen met de buurt via open workshops.',
    'Het meest verrassende antwoord: een 78-jarige dame die zei "Amsterdam betekent voor mij dat je er altijd iemand bent die op je wacht." Dat raakte ons allemaal diep.',
    'We vonden een vintage boek over stedenbouw uit 1968. Verhaal: een stadsplanner die droomde van een groene stad. Onze organisatie geeft tweede kansen door mensen te herplaatsen vanuit burnout.',
    'Emma: "Ik wil mijn geduld laten groeien." Tom: "Mijn vermogen om écht te luisteren." Sara: "Durf om nee te zeggen." We hebben een cactus gefotografeerd — sterk, spaarzaam, groeit langzaam maar zeker.',
    'Ons bereik vandaag: 14 gesprekken gevoerd, 6 interviews afgenomen, 3 marktkraamhouders gesproken. Impact gemaakt voor 14 mensen die even aandacht kregen!',
  ],
  'Team De Pijp': [
    'Ons hofje zou focussen op "mentale gezondheid voor jongeren in de stad" — want dat missen we nu het meest in Amsterdam.',
    'Drie reacties: "Amsterdam is vrijheid" (student, 22). "Amsterdam is mijn werk en mijn leven" (horecaondernemer, 45). "Amsterdam is te druk geworden" (oudere bewoner, 70). We waren het meest geraakt door de ondernemer die zei dat hij niet meer weg wil maar bang is voor de huren.',
    'Vintage jaren-80 spijkerjack met handgeschilderde tekst: "Geen woorden maar daden." Perfect voor ons team. Wij geven tweede kansen via re-integratietrajecten.',
    'Floor wil haar "nee zeggen" groeien. Bas wil meer creativiteit. Roos wil meer rust. We fotografeerden een Japanse bonsai — klein maar perfect gevormd door aandacht en geduld.',
    'Bereik vandaag: 11 gesprekken, 4 interviews. Lars heeft het beste compliment gegeven: "Roos heeft vandaag impact gemaakt door nooit haar telefoon te pakken — ze was er 100% voor ons."',
  ],
  'Team Amstel': [
    'Onze hofje-missie: "Een plek waar fouten maken mag en je altijd een tweede start krijgt." Geïnspireerd door de bethuinen van vroeger.',
    'Verrassendste antwoord: een tiener (17) die zei "Amsterdam is de plek waar niemand je vraagt waarom." Dat gevoel van vrijheid zonder oordeel raakte ons.',
    'Oud houten kistje. Verhaal: iemand die hiermee op reis ging en het na terugkeer verkocht. Wij geven mensen een tweede kans na werkloosheid.',
    'Kevin: wil zijn presentatieskills ontwikkelen. Lisa: wil meer initiatief nemen. Samen fotografeerden we een orchidee — mooi maar vraagt consistente zorg.',
    'Bereik: 9 gesprekken gevoerd. Kevin complimenteerde Lisa: "Lisa heeft vandaag impact gemaakt door die lastige markthandelaar toch te benaderen — respect!"',
  ],
  'Team Noord': [
    'Ons hofje: "Een plek waar iedereen welkom is, ongeacht achtergrond." Simpel maar krachtig.',
    'Twee reacties: "Amsterdam is duur" en "Amsterdam is mijn thuis al 30 jaar." De tegenstelling zei genoeg.',
    'Een oud kookboek vol aantekeningen van de vorige eigenaar. Verhaal van iemand die echt kookte met liefde. Wij geven mensen kansen door ze te leren koken in buurtkeukens.',
    'Meryem: wil haar leiderschap laten groeien. Daan: meer geduld. We zagen een grote cactus en dachten: zo groeien wij ook — langzaam, maar met veel weerstand.',
    'Bereik: 8 gesprekken. Meryem complimenteerde Daan: "Daan heeft vandaag impact gemaakt door de hele tocht positief te blijven, ook toen we verkeerd liepen."',
  ],
}

async function seed() {
  console.log('\n🌱 Seeding Amsterdam Impact Wandeling (demo voor homepage)...\n')

  // ─── Spelleider ──────────────────────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Demo Spelleider', ${EMAIL}, 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET name = 'Demo Spelleider'
    RETURNING id
  `
  console.log(`✓ Spelleider: ${EMAIL} (id: ${spelleider.id})`)

  // ─── Tour ────────────────────────────────────────────────────────────────
  let [tour] = await sql`
    SELECT id FROM tours WHERE name = 'Amsterdam Impact Wandeling' LIMIT 1
  `
  if (!tour) {
    ;[tour] = await sql`
      INSERT INTO tours (
        name, description, variant, created_by_id,
        is_published, estimated_duration_min, max_teams, price_in_cents
      ) VALUES (
        'Amsterdam Impact Wandeling',
        'Ontdek de sociale ziel van Amsterdam: van het eeuwenoude Begijnhof tot het bruisende Oosterpark. Verbind je team via echte gesprekken met Amsterdammers, marktkooplui en buurtbewoners — en meet jullie gezamenlijke impact.',
        'wijktocht',
        ${spelleider.id},
        true,
        120,
        20,
        24900
      )
      RETURNING id
    `
    console.log(`✓ Tour aangemaakt: Amsterdam Impact Wandeling (id: ${tour.id})`)
  } else {
    console.log(`✓ Tour bestaat al: Amsterdam Impact Wandeling (id: ${tour.id})`)
  }

  // ─── Checkpoints ─────────────────────────────────────────────────────────
  const cpIds: string[] = []
  const existingCps = await sql`
    SELECT id, order_index FROM checkpoints WHERE tour_id = ${tour.id} ORDER BY order_index
  `
  if (existingCps.length === CHECKPOINTS.length) {
    // Hergebruik bestaande checkpoints
    for (const row of existingCps) {
      cpIds.push(row.id as string)
    }
    console.log(`✓ Checkpoints al aanwezig (${cpIds.length} stuks)`)
  } else {
    // Wis eventuele gedeeltelijke inserts en maak opnieuw aan
    await sql`DELETE FROM checkpoints WHERE tour_id = ${tour.id}`
    for (const cp of CHECKPOINTS) {
      const [row] = await sql`
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
        RETURNING id
      `
      cpIds.push(row.id)
      console.log(`  ✓ CP${cp.order + 1}: ${cp.name} (id: ${row.id})`)
    }
  }

  // ─── Game sessie (completed) ──────────────────────────────────────────────
  const [session] = await sql`
    INSERT INTO game_sessions (
      tour_id, spelleider_id, status, join_code, variant,
      custom_session_name, organization_name, source
    ) VALUES (
      ${tour.id}, ${spelleider.id}, 'completed', 'AMST24', 'wijktocht',
      'ImpactWandeling Amsterdam — Zorg & Welzijn Congres 2024',
      'WeAreImpact B.V.',
      'marketplace'
    )
    ON CONFLICT (join_code) DO UPDATE SET
      status = 'completed',
      tour_id = EXCLUDED.tour_id
    RETURNING id
  `
  console.log(`\n✓ Sessie (joincode: AMST24, id: ${session.id})`)

  // ─── Teams + submissions + session_scores ─────────────────────────────────
  for (const teamDef of TEAMS) {
    // GMS totalen berekenen
    const dimTotals = teamDef.scores.reduce(
      (acc, [c, m, j, g]) => ({
        connection: acc.connection + c,
        meaning: acc.meaning + m,
        joy: acc.joy + j,
        growth: acc.growth + g,
      }),
      { connection: 0, meaning: 0, joy: 0, growth: 0 }
    )
    const totalGms =
      dimTotals.connection + dimTotals.meaning + dimTotals.joy + dimTotals.growth

    // Alle checkpoints voltooid
    const completedCheckpoints = JSON.stringify(cpIds)

    const [team] = await sql`
      INSERT INTO teams (
        game_session_id, name, team_token,
        total_gms_score, bonus_points,
        current_checkpoint_index, completed_checkpoints,
        is_active
      ) VALUES (
        ${session.id}, ${teamDef.name}, ${teamDef.token},
        ${totalGms}, 0,
        ${CHECKPOINTS.length}, ${completedCheckpoints},
        true
      )
      ON CONFLICT (team_token) DO UPDATE SET
        total_gms_score = EXCLUDED.total_gms_score,
        completed_checkpoints = EXCLUDED.completed_checkpoints,
        current_checkpoint_index = EXCLUDED.current_checkpoint_index
      RETURNING id
    `
    console.log(`\n  ✓ Team: ${teamDef.name} (${teamDef.members} mensen, GMS: ${totalGms})`)

    // Submissions per checkpoint
    const cpScoresForSessionScores: { name: string; gmsEarned: number; orderIndex: number }[] = []

    const answers = ANSWERS[teamDef.name]
    for (let i = 0; i < CHECKPOINTS.length; i++) {
      const cp = CHECKPOINTS[i]
      const [c, m, j, g] = teamDef.scores[i]
      const gmsEarned = c + m + j + g

      const hoursAgo = CHECKPOINTS.length - i
      const submittedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
      const aiScore = Math.round((gmsEarned / (cp.connection + cp.meaning + cp.joy + cp.growth)) * 100)
      const aiEval = JSON.stringify({ connection: c, meaning: m, joy: j, growth: g, reasoning: 'Team toont sterke verbinding en reflectief vermogen.' })

      await sql`
        INSERT INTO submissions (
          team_id, checkpoint_id,
          answer, status,
          ai_score, ai_feedback,
          ai_evaluation,
          gms_earned,
          submitted_at
        ) VALUES (
          ${team.id}, ${cpIds[i]},
          ${answers[i]}, 'approved',
          ${aiScore},
          'Goede inzending! Jullie team heeft de kern van de opdracht geraakt en laat echte betrokkenheid zien.',
          ${aiEval},
          ${gmsEarned},
          ${submittedAt}
        )
        ON CONFLICT DO NOTHING
      `

      cpScoresForSessionScores.push({
        name: cp.name,
        gmsEarned,
        orderIndex: i,
      })
      console.log(`    → CP${i + 1} ${cp.name}: +${gmsEarned} GMS (${c}/${m}/${j}/${g})`)
    }

    // Session scores (gedenormaliseerd, fast path voor rapport)
    await sql`
      INSERT INTO session_scores (
        session_id, team_id,
        connection, meaning, joy, growth, total_gms,
        checkpoints_count, checkpoint_scores,
        coach_insight,
        updated_at
      ) VALUES (
        ${session.id}, ${team.id},
        ${dimTotals.connection}, ${dimTotals.meaning}, ${dimTotals.joy}, ${dimTotals.growth}, ${totalGms},
        ${CHECKPOINTS.length}, ${JSON.stringify(cpScoresForSessionScores)},
        ${COACH_INSIGHTS[teamDef.name]},
        now()
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    console.log(`    → Session scores opgeslagen (conn:${dimTotals.connection} mean:${dimTotals.meaning} joy:${dimTotals.joy} growth:${dimTotals.growth})`)
  }

  // ─── Samenvatting ──────────────────────────────────────────────────────────
  const gmsMax = CHECKPOINTS.reduce((s, cp) => s + cp.connection + cp.meaning + cp.joy + cp.growth, 0)

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Amsterdam demo seed compleet!

📍 TOUR: Amsterdam Impact Wandeling
   Joincode:  AMST24
   Status:    completed (klaar voor screenshots)
   GMS max:   ${gmsMax} punten (5 checkpoints)

🗺️  Route (N→O richting):
   1. Begijnhof         (52.3703, 4.8888)  — Historisch hofje
   2. Nieuwmarkt        (52.3731, 4.9001)  — De Waag, diversiteit
   3. Waterlooplein     (52.3664, 4.9007)  — Vlooienmarkt
   4. Hortus Botanicus  (52.3664, 4.9072)  — Botanische tuin
   5. Oosterpark        (52.3603, 4.9195)  — Eindpunt viering

🏆 Eindstand (22 deelnemers):
${TEAMS.map((t, i) => {
  const total = t.scores.reduce(([sc, sm, sj, sg], [c, m, j, g]) =>
    [sc + c, sm + m, sj + j, sg + g], [0, 0, 0, 0]).reduce((a, b) => a + b, 0)
  const pct = Math.round((total / gmsMax) * 100)
  const badge = pct >= 70 ? '🏅 Hoge Impact!' : ''
  return `   ${i + 1}. ${t.name} (${t.members}p) — ${total}/${gmsMax} (${pct}%) ${badge}`
}).join('\n')}

📱 Screenshots maken:
   1. Log in als: ${EMAIL}
   2. Open sessie AMST24 in het admin panel
   3. Bekijk de voltooide sessie — alle schermen zijn gevuld met data

   Of ga direct naar de client-pagina via:
   /klant/[sessionId]/resultaten

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
