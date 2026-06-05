/**
 * Seed: Westerpark — Teamdag Geluksmomenten
 *
 * Gebruik:
 *   bun scripts/seed-westerpark-teamdag.ts [spelleider-email]
 *
 * Wat dit maakt:
 *   - Tour "Westerpark — Teamdag" met 12 checkpoints over 4 fases
 *   - FASE 1 (12:20–13:15): 4 opdrachten bij ingang Westerpark
 *   - FASE 2 (13:15–13:35): 2 opdrachten bij Boerderij Westerpark
 *   - FASE 3 (14:30):       2 geluksmomenten halverwege
 *   - FASE 4 (15:30–16:00): 4 afsluiting/reflectie incl. woordwolk
 *   - Losse game-sessie in TEST MODE (join code WEST25)
 *
 * Geluksmomenten score voor Marlieke:
 *   Score = (verbinding_antwoord + trots_antwoord) / 2 × 10 = 0–100
 *   Checkpoint 7 (GM1, verbinding) + Checkpoint 12 (Afsluiter, trots)
 *   Twee keer een 8 → gemiddelde 8 × 10 = score 80
 *
 * ⚠️  GPS-coördinaten zijn op kaartbasis bepaald — verifieer on-site!
 *     Ingang Westerpark:  52.3872, 4.8718 (Haarlemmerweg-zijde)
 *     Boerderij Westerpark: 52.3855, 4.8662 (stadsboerderij in park)
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

// ─── Locaties ────────────────────────────────────────────────────────────────
// Ingang Westerpark (kick-off punt) — Haarlemmerweg/Nassauplein zijde
const INGANG_LAT = 52.3872
const INGANG_LNG = 4.8718

// Boerderij Westerpark (stadsboerderij in het park)
const BOERDERIJ_LAT = 52.3855
const BOERDERIJ_LNG = 4.8662

const checkpoints = [
  // ════════════════════════════════════════════════════════════════════════════
  // FASE 1 — IctusGo route (12:20–13:15) | Ingang Westerpark
  // ════════════════════════════════════════════════════════════════════════════

  {
    orderIndex: 0,
    name: 'F1-1 — Samenwerkingsopdracht',
    type: 'samenwerking',
    missionTitle: '🗿 Levend standbeeld: "Samenwerking"',
    missionDescription: `Welkom bij de kick-off van jullie teamdag in Westerpark!

Jullie eerste opdracht:

Maak met jullie team een levend standbeeld dat het woord "samenwerking" uitbeeldt.
Geen woorden gebruiken. Geen aanwijzingen. Alleen lichaamstaal en positie.

Neem de tijd om het samen te bedenken — en zorg dat iedereen een rol heeft in het beeld.
Als het echt staat: maak een foto en stuur die in via de app.

Wat maakt jullie versie van samenwerking bijzonder?`,
    missionType: 'foto',
    lat: INGANG_LAT,
    lng: INGANG_LNG,
    unlockRadius: 100,
    gmsConnection: 20,
    gmsMeaning: 5,
    gmsJoy: 10,
    gmsGrowth: 5,
    hint1: 'Denk aan vormen: een cirkel, een piramide, iemand die de ander optilt of ondersteunt.',
    hint2: 'Samenwerking gaat ook over richting — kijkt iedereen dezelfde kant op of juist een andere?',
    hint3: 'Probeer het beeld eerst zonder te praten te maken. Dan nog een keer met overleg. Welke is beter?',
  },

  {
    orderIndex: 1,
    name: 'F1-2 — Natuuropdracht',
    type: 'reflectie',
    missionTitle: '🍃 Vijf dingen uit de natuur — een verhaal van 30 seconden',
    missionDescription: `Jullie staan in Westerpark.

Verzamel als team 5 dingen uit de natuur die samen een verhaal vertellen.
Ieder teamlid pakt iets. Geen plastic, geen rotzooi — écht natuur.
Een steen, een blad, een tak, een veertje, een beetje aarde. Jij kiest.

Als je vijf dingen hebt: leg ze samen neer.
Bespreek in één minuut: wat is het verhaal?

Dan presenteert één teamlid het verhaal aan de rest — maximaal 30 seconden.
Beschrijf daarna in je antwoord: welke 5 dingen jullie kozen én wat het verhaal was.`,
    missionType: 'opdracht',
    lat: INGANG_LAT,
    lng: INGANG_LNG,
    unlockRadius: 100,
    gmsConnection: 5,
    gmsMeaning: 20,
    gmsJoy: 10,
    gmsGrowth: 5,
    hint1: 'Laat iedereen iets zoeken wat hem of haar aanspreekt — niet afstemmen, gewoon verzamelen.',
    hint2: 'Geen verhaal voor handen? Begin met: "Dit zijn vijf dingen die samen één dag in het park beschrijven."',
    hint3: '30 seconden is korter dan je denkt. Eén sterke zin per ding is genoeg.',
  },

  {
    orderIndex: 2,
    name: 'F1-3 — Creatieve opdracht',
    type: 'samenwerking',
    missionTitle: '✏️ Nieuwe naam voor Westerpark — in één zin',
    missionDescription: `Westerpark. Dat is de naam al 150 jaar.

Maar als jullie het mochten hernoemen — vandaag, op basis van wat jullie hier zien, ruiken en voelen — wat zou de naam dan zijn?

Denk niet te lang. Neem vijf minuten om ideeën op te noemen. Kies er samen één uit.
De naam mag grappig zijn, poëtisch, of heel letterlijk.

Typ je antwoord zo in:
"Nieuwe naam: [naam]"
"Waarom: [één zin die het motiveert]"`,
    missionType: 'opdracht',
    lat: INGANG_LAT,
    lng: INGANG_LNG,
    unlockRadius: 100,
    gmsConnection: 5,
    gmsMeaning: 15,
    gmsJoy: 15,
    gmsGrowth: 5,
    hint1: 'Wat valt jullie het meest op hier? Gebruik dat als vertrekpunt voor de naam.',
    hint2: 'Een goede naam bevat een verrassing. "Groen" is saai — "de plek waar we ophouden met rennen" is beter.',
    hint3: 'Eén woord mag ook — maar dan wil de motivatie zin echt iets vertellen.',
  },

  {
    orderIndex: 3,
    name: 'F1-4 — Reflectievraag',
    type: 'reflectie',
    missionTitle: '👁️ Wat zie jij hier dat je normaal nooit ziet?',
    missionDescription: `Je staat buiten. In een park. Midden op een doordeweekse dag.

Kijk om je heen — écht kijken, niet scrollen.

Beantwoord voor jezelf:

"Wat zie je hier in de buurt dat je normaal nooit ziet als je op kantoor zit?"

Niet het meest voor de hand liggende antwoord. Iets wat je echt opvalt.
Laat elk teamlid één ding opnoemen. Schrijf alle antwoorden op en stuur ze in.`,
    missionType: 'opdracht',
    lat: INGANG_LAT,
    lng: INGANG_LNG,
    unlockRadius: 100,
    gmsConnection: 10,
    gmsMeaning: 20,
    gmsJoy: 5,
    gmsGrowth: 5,
    hint1: 'Kijk dichtbij: insecten, gras, schaduw, modder. Dingen die op kantoor nooit aanwezig zijn.',
    hint2: 'Kijk naar mensen: wie is hier midden op de dag en waarom? Dat zie je ook nooit achter een bureau.',
    hint3: 'Iedereen zegt iets anders — dat is de bedoeling. Het gaat om breedte, niet om consensus.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 2 — Boerderij kennismaking (13:15–13:35) | Boerderij Westerpark
  // ════════════════════════════════════════════════════════════════════════════

  {
    orderIndex: 4,
    name: 'F2-1 — Vrijwilligersvraag',
    type: 'actie',
    missionTitle: '🌱 Spreek een vrijwilliger aan — waarom komen ze hier?',
    missionDescription: `Je staat bij de Boerderij Westerpark.
Hier werken vrijwilligers elke week mee aan de boerderij, de tuin en de gemeenschap.

Jouw opdracht: zoek één vrijwilliger op.
Stel je voor, vertel kort wat jullie vandaag doen.
Stel dan deze ene vraag:

"Wat brengt jou hier elke week terug?"

Luister écht. Stel een doorvraag als je wil weten waarom.

Deel daarna het antwoord met je team. Wat raakt jullie het meest aan wat hij of zij zei?
Schrijf het antwoord van de vrijwilliger op — in zijn of haar eigen woorden, zo letterlijk mogelijk.`,
    missionType: 'opdracht',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 80,
    gmsConnection: 15,
    gmsMeaning: 20,
    gmsJoy: 0,
    gmsGrowth: 5,
    hint1: 'Begin met: "Wij zijn hier voor een teamdag en spreken mensen aan die hier werken. Mag ik je iets vragen?"',
    hint2: 'Niemand gevonden? Vraag bij de ingang of kassa wie de vrijwilligers zijn.',
    hint3: 'Een goede doorvraag: "Wat was het moment waarop je wist dat je hier wou terugkomen?"',
  },

  {
    orderIndex: 5,
    name: 'F2-2 — Teamopdracht',
    type: 'reflectie',
    missionTitle: '💡 Wat doet jullie organisatie morgen anders?',
    missionDescription: `Jullie hebben de boerderij gezien. De mensen. De manier van werken.

Bedenk nu samen — geïnspireerd door wat jullie hier zien — één ding dat jullie organisatie morgen anders zou kunnen doen.

Niet: "we moeten meer samenwerken."
Wél: een concreet, uitvoerbaar idee dat past bij wat jullie hier hebben meegemaakt.

Bespreek het vijf minuten. Iedereen brengt één suggestie in. Kies samen de sterkste.

Typ het zo in:
"Idee: [concreet idee]"
"Geïnspireerd door: [wat je hier zag of hoorde]"`,
    missionType: 'opdracht',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 80,
    gmsConnection: 5,
    gmsMeaning: 15,
    gmsJoy: 0,
    gmsGrowth: 20,
    hint1: 'Denk aan de schaal: wat je hier zag op kleine schaal, kan dat werken in jullie organisatie?',
    hint2: 'Denk aan de sfeer: wat maakt dat mensen hier vrijwillig terugkomen? Kan dat ook op jullie werk?',
    hint3: 'Het idee hoeft niet perfect te zijn — het moet herkenbaar zijn als dit team. Iets wat alleen jullie zouden bedenken.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 3 — Geluksmomenten check halverwege (14:30)
  // ════════════════════════════════════════════════════════════════════════════

  {
    orderIndex: 6,
    name: 'GM1 — Verbinding (schaalvraag)',
    type: 'reflectie',
    missionTitle: '💚 Geluksmoment 1 — Hoe verbonden voel jij je?',
    missionDescription: `Halverwegemoment.

Iedereen beantwoordt individueel, hardop of in gedachten:

"Hoe verbonden voel jij je op dit moment met je team?"

Geef een cijfer van 1 tot 10.
1 = ik sta er volledig alleen voor
10 = ik voel me compleet onderdeel van dit team

Overleg niet. Geef je eerste eerlijke getal.
Schrijf het gemiddelde van je team in als antwoord — of alle individuele cijfers als je dat eerlijker vindt.

📊 Dit cijfer wordt gebruikt voor jullie Geluksmomenten Score.`,
    missionType: 'schaalvraag',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 500,
    gmsConnection: 25,
    gmsMeaning: 5,
    gmsJoy: 5,
    gmsGrowth: 5,
    hint1: 'Er is geen goed of fout antwoord. Een eerlijk laag cijfer is waardevoller dan een sociaal wenselijk hoog cijfer.',
    hint2: 'Wil je meer informatie? Vraag aan degene met het laagste cijfer: "Wat heb jij nodig om een punt hoger te komen?"',
    hint3: 'Schrijf het gemiddelde op als één getal, bijv: "7.2" of "gemiddeld 8 — range 6 tot 9"',
  },

  {
    orderIndex: 7,
    name: 'GM2 — Collega die verraste',
    type: 'reflectie',
    missionTitle: '⭐ Geluksmoment 2 — Wie verraste jou vandaag?',
    missionDescription: `Halverwege de dag — en er zijn al dingen gebeurd die je niet had verwacht.

Noem één collega die je vandaag verraste.
Wat deed hij of zij?

Schrijf in je antwoord:
"[Naam of omschrijving] verraste mij omdat..."

Iedereen doet mee. Geen collega overslaan. Geen herhaling verplicht.
Schrijf alle antwoorden op en stuur ze in.`,
    missionType: 'opdracht',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 500,
    gmsConnection: 20,
    gmsMeaning: 10,
    gmsJoy: 10,
    gmsGrowth: 0,
    hint1: 'Verrassing hoeft niet groot te zijn: iets grappig zeggen, een onverwacht idee, harder meedoen dan verwacht.',
    hint2: 'Niemand die je echt verraste? Vraag jezelf: wie deed iets wat je van hem of haar niet had verwacht?',
    hint3: 'Je mag ook iemand noemen die hier niet bij is — een collega die achterbleef op kantoor, bijv.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 4 — Afsluiting en reflectie (15:30–16:00)
  // ════════════════════════════════════════════════════════════════════════════

  {
    orderIndex: 8,
    name: 'GM3 — Persoonlijk hoogtepunt',
    type: 'reflectie',
    missionTitle: '🏆 Geluksmoment 3 — Jouw persoonlijke hoogtepunt',
    missionDescription: `De dag loopt naar zijn einde.

Beantwoord voor jezelf — eerlijk en persoonlijk:

"Wat was jouw persoonlijke hoogtepunt van de afgelopen twee uur?"

Niet het leukste van het team. Jouw eigen moment. Het moment dat bij jou blijft.

Iedereen deelt één antwoord. Geen samenvatting — deel letterlijk wat iedereen zei.`,
    missionType: 'opdracht',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 500,
    gmsConnection: 5,
    gmsMeaning: 25,
    gmsJoy: 10,
    gmsGrowth: 0,
    hint1: 'Niet het hoogtepunt dat iedereen zag — het moment dat jij persoonlijk het meest voelde.',
    hint2: 'Kan een klein moment zijn: een opmerking, een beeld, een stilte. Grootte telt niet.',
    hint3: 'Schrijf het op zoals het gezegd werd. Laat de woorden van iedereen naast elkaar staan.',
  },

  {
    orderIndex: 9,
    name: 'GM4 — Maandag anders',
    type: 'reflectie',
    missionTitle: '📅 Geluksmoment 4 — Wat doe jij maandag anders?',
    missionDescription: `Morgen ga je weer aan het werk.

Beantwoord voor jezelf:

"Wat wil jij maandag anders doen op het werk na vandaag?"

Geen grote beloftes. Geen plannen die je al wist.
Iets concreets — één ding, dat je anders aanpakt, omdat je vandaag iets hebt ervaren.

Iedereen deelt zijn of haar antwoord. Schrijf alle antwoorden op en stuur ze in.`,
    missionType: 'opdracht',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 500,
    gmsConnection: 5,
    gmsMeaning: 5,
    gmsJoy: 5,
    gmsGrowth: 25,
    hint1: '"Ik ga meer samenwerken" telt niet — te vaag. Denk aan: wanneer, met wie, in welke situatie.',
    hint2: 'De beste antwoorden zijn klein en uitvoerbaar: "Ik ga maandag als eerste iemand een compliment geven."',
    hint3: 'Schrijf alle antwoorden letterlijk op. Ze worden gebruikt in het eindrapport.',
  },

  {
    orderIndex: 10,
    name: 'Woordwolk — Één woord voor deze dag',
    type: 'feest',
    missionTitle: '☁️ Woordwolk — Geef de dag één woord',
    missionDescription: `Bijna klaar.

Elk teamlid geeft de dag één woord.
Niet twee woorden. Niet een zin. Één woord.

Het eerste woord dat in je opkomt. Denk niet te lang.

Stuur alle woorden in als antwoord — gescheiden door een komma.
Bijv: "verbinding, rust, verrassing, energie, dankbaar"

De app maakt er een woordwolk van.`,
    missionType: 'woordwolk',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 500,
    gmsConnection: 5,
    gmsMeaning: 15,
    gmsJoy: 15,
    gmsGrowth: 5,
    hint1: 'Geen tijd voor nadenken. Wat schiet er als eerste te binnen? Dat is het woord.',
    hint2: 'Mag positief zijn, maar hoeft niet. "Vermoeid" is ook een eerlijk antwoord.',
    hint3: 'Schrijf ze gescheiden door komma\'s, bijv: "licht, verbinding, groei, blij, buiten"',
  },

  {
    orderIndex: 11,
    name: 'Afsluiter — Trots (schaalvraag)',
    type: 'feest',
    missionTitle: '🌟 Afsluiter — Hoe trots ben jij op jullie team?',
    missionDescription: `Laatste vraag van de dag.

Iedereen beantwoordt — eerlijk en zonder afstemming:

"Hoe trots ben jij op wat jullie team vandaag heeft neergezet?"

Geef een cijfer van 1 tot 10.
1 = ik ben niet onder de indruk
10 = dit team heeft vandaag iets bijzonders laten zien

Schrijf het gemiddelde van je team in als antwoord.

📊 Dit cijfer wordt samen met Geluksmoment 1 gebruikt voor jullie Geluksmomenten Score.
   Score = (verbinding + trots) / 2 × 10`,
    missionType: 'schaalvraag',
    lat: BOERDERIJ_LAT,
    lng: BOERDERIJ_LNG,
    unlockRadius: 500,
    gmsConnection: 10,
    gmsMeaning: 10,
    gmsJoy: 10,
    gmsGrowth: 10,
    hint1: 'Er is geen goed of fout. Een 6 die gemeend is, is meer waard dan een 9 die sociaal wenselijk is.',
    hint2: 'Wil je het gesprek aangaan? Vraag degene met het laagste cijfer wat hij/zij mist.',
    hint3: 'Schrijf als antwoord het teamgemiddelde als één getal, bijv: "8" of "gemiddeld 7.5"',
  },
]

async function seed() {
  const email = process.argv[2] || 'v.munster@weareimpact.nl'
  console.log('\n🌿 Seeding Westerpark — Teamdag Geluksmomenten...\n')
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
      'Westerpark — Teamdag',
      'Een halve dag teambuilding in Westerpark Amsterdam. Vier fases: een GPS-route langs de ingang (FASE 1), een kennismaking bij de Boerderij Westerpark (FASE 2), een halverwegemoment met geluksvragen (FASE 3) en een reflectieve afsluiting met woordwolk (FASE 4). Geluksmomenten score: gemiddelde van verbindingsvraag + trotsvraag × 10 (0–100).',
      'impactsprint',
      ${spelleider.id},
      false,
      220,
      20,
      0,
      'flat',
      ${JSON.stringify({
        location: 'Westerpark, Amsterdam',
        targetGroup: 'Corporate teams — teambuilding',
        themes: ['verbinding', 'betekenis', 'plezier', 'groei'],
        assistantPersona: 'Buddy',
        routeType: 'wandeling',
        startPoint: 'Ingang Westerpark, Haarlemmerweg-zijde',
        endPoint: 'Boerderij Westerpark',
        geluksMomentenScore: {
          formule: '(GM1_verbinding + Afsluiter_trots) / 2 × 10',
          checkpoints: {
            GM1: 'orderIndex 6 — schaalvraag verbinding 1–10',
            Afsluiter: 'orderIndex 11 — schaalvraag trots 1–10',
          },
          voorbeeld: 'Verbinding 8 + Trots 8 → gemiddelde 8 × 10 = score 80/100',
          toelichting: 'Eenvoudig en uitlegbaar aan Marlieke. Twee vragen, één getal.',
        },
        tijdschema: {
          FASE1: '12:20–13:15 — IctusGo route bij ingang Westerpark (4 opdrachten)',
          FASE2: '13:15–13:35 — Boerderij kennismaking (2 opdrachten)',
          FASE3: '14:30       — Geluksmomenten check halverwege (2 vragen)',
          FASE4: '15:30–16:00 — Afsluiting en reflectie (4 vragen incl. woordwolk)',
        },
        gpsVerificatieVereist: true,
        notes: [
          'GPS-coördinaten zijn kaartgebaseerd — loop route voor live-go',
          'FASE 3 en 4 hebben radius 500m — tijdgebaseerd, niet GPS-gestuurd',
          'Woordwolk (CP11) en schaalvragen (CP7, CP12) zijn custom missionTypes — worden als tekst ingestuurd',
          'Geluksmomenten score bereken je handmatig: zie formule boven',
        ],
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
    const fase = cp.orderIndex < 4 ? 'F1' : cp.orderIndex < 6 ? 'F2' : cp.orderIndex < 8 ? 'F3' : 'F4'
    console.log(`  ✓ CP${cp.orderIndex + 1} [${fase}]: ${cp.name}`)
  }

  // ─── Game sessie aanmaken ─────────────────────────────────────────────────────
  const joinCode = 'WEST25'

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
      'lobby',
      ${joinCode},
      'impactsprint',
      true,
      'Westerpark Teamdag',
      'Welkom bij jullie teamdag in Westerpark! Jullie gaan op pad langs de ingang, naar de Boerderij en sluiten af met een geluksmoment. Veel plezier en succes met de opdrachten!',
      'direct'
    ) RETURNING id
  `
  console.log(`  ✓ Sessie aangemaakt: id ${session.id} | code: ${joinCode}`)

  // ─── Demo team aanmaken ───────────────────────────────────────────────────────
  const teamToken = crypto.randomBytes(16).toString('hex')

  const [team] = await sql`
    INSERT INTO teams (
      game_session_id,
      name,
      team_token,
      is_active
    ) VALUES (
      ${session.id},
      'Team Demo',
      ${teamToken},
      true
    ) RETURNING id
  `
  console.log(`  ✓ Demo team aangemaakt: "Team Demo" | id: ${team.id}`)

  // ─── Resultaat ────────────────────────────────────────────────────────────────
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║      ✅ Westerpark — Teamdag klaar!                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  JOIN URL (spelleider → teams sturen):                           ║
║  ${(baseUrl + '/join?code=' + joinCode).padEnd(64)}║
║                                                                  ║
║  Joincode: ${joinCode.padEnd(56)}║
║                                                                  ║
║  TIJDSCHEMA                                                       ║
║  12:20–13:15  FASE 1 — IctusGo route (ingang Westerpark)        ║
║               CP1  Samenwerkingsopdracht (foto)                  ║
║               CP2  Natuuropdracht (opdracht)                     ║
║               CP3  Creatieve opdracht (opdracht)                 ║
║               CP4  Reflectievraag (opdracht)                     ║
║                                                                  ║
║  13:15–13:35  FASE 2 — Boerderij Westerpark                     ║
║               CP5  Vrijwilligersvraag (opdracht)                 ║
║               CP6  Teamopdracht morgen anders (opdracht)         ║
║                                                                  ║
║  14:30        FASE 3 — Halverwege check                          ║
║               CP7  Verbinding 1–10 (schaalvraag) ← GM SCORE     ║
║               CP8  Collega die verraste (opdracht)               ║
║                                                                  ║
║  15:30–16:00  FASE 4 — Afsluiting                               ║
║               CP9   Persoonlijk hoogtepunt (opdracht)            ║
║               CP10  Maandag anders (opdracht)                    ║
║               CP11  Woordwolk — één woord (woordwolk)            ║
║               CP12  Trots 1–10 (schaalvraag) ← GM SCORE         ║
║                                                                  ║
║  GELUKSMOMENTEN SCORE (voor Marlieke):                           ║
║  Score = (CP7_verbinding + CP12_trots) / 2 × 10                 ║
║  Voorbeeld: verbinding 8 + trots 8 → score 80/100               ║
║                                                                  ║
║  GPS-ANKERPUNTEN (verifieer on-site!):                           ║
║  Ingang Westerpark   52.3872, 4.8718  (radius 100m)             ║
║  Boerderij Westerpark 52.3855, 4.8662 (radius 80m/500m)         ║
║                                                                  ║
║  Admin panel: /admin                                             ║
║  Spelleider panel: /spelleider/sessies/${session.id.substring(0, 24)}║
║                                                                  ║
║  ⚠️  TEST MODE aan — GPS-check is soepeler                       ║
║  ⚠️  GPS-coördinaten zijn kaartgebaseerd — verifieer on-site!   ║
╚══════════════════════════════════════════════════════════════════╝
`)
}

seed().catch((e) => {
  console.error('❌ Seed fout:', e)
  process.exit(1)
})
