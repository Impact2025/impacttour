/**
 * Seeder: Hoofddorp Ontdekt — Complete ICTUSGO-route
 *
 * GPS-gestuurd teambuilding door Hoofddorp: van het historische Raadhuis
 * via Dik Trom, Kruisweg en de Bijbelse Tuin naar de Hoofdvaart en
 * de finish bij Restaurant Long Island aan de Toolenburgerplas.
 *
 * Duur:        2,5 uur (excl. nabespreking)
 * Afstand:     ±4,5 km — volledig verhard, rolstoeltoegankelijk
 * Groep:       8–40 personen / 2–8 teams van 4–6
 * Startpunt:   Oude Raadhuis, Kruisweg 103, Hoofddorp
 * Eindpunt:    Toolenburgerplas, Restaurant Long Island
 *
 * ⚠️  GPS-coördinaten zijn zorgvuldig bepaald op basis van kaartonderzoek
 *     maar moeten ter plekke worden geverifieerd. Loop de route één keer
 *     volledig door met de app open vóór de eerste boeking.
 *
 * Uitvoeren:
 *   bunx tsx scripts/seed-hoofddorp-ontdekt.ts [spelleider-email]
 *
 * Voorbeeld:
 *   bunx tsx scripts/seed-hoofddorp-ontdekt.ts spelleider@impacttocht.nl
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  const spelleiderEmail = process.argv[2] || 'spelleider@impacttocht.nl'

  console.log('\n🏛️  Seeding Hoofddorp Ontdekt...\n')
  console.log(`   Spelleider: ${spelleiderEmail}`)

  // ─── Spelleider ophalen of aanmaken ────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Demo Spelleider', ${spelleiderEmail}, 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  console.log(`✓ Spelleider: ${spelleider.id}`)

  // ─── Tour aanmaken ─────────────────────────────────────────────────────────
  const aiConfig = JSON.stringify({
    location: 'Hoofddorp',
    region: 'Noord-Holland / Haarlemmermeer',
    tagline: 'De buurt achter het bedrijventerrein — van het 19e-eeuwse Raadhuis tot de Toolenburgerplas.',
    emoji: '🏛️',
    difficulty: 'laag',
    themes: ['verbinding', 'betekenis', 'buurt', 'sociale impact', 'lokale identiteit'],
    targetGroup: 'Zakelijke teams — bedrijven die meer willen dan een leuke middag',
    emotionalArc: 'Activering → Verwondering → Verbinding → Diepgang → Ontdekking → Landen',
    startLocation: 'Oude Raadhuis, Kruisweg 103, Hoofddorp',
    endLocation: 'Toolenburgerplas, Restaurant Long Island',
    accessibility: 'Volledig verhard, rolstoeltoegankelijk',
    season: 'Jaar rond — sterkst in voorjaar en zomer',
    notes: [
      'Bijbelse Tuin (CP4) is open ma–za overdag — verifieer openingstijden voor boeking',
      'Verborgen code bij Hoofdvaart (CP5) moet ter plekke worden vastgesteld — zie CP5 description',
      'Long Island of vergelijkbare horecapartner aanbevolen als finish-locatie voor nabespreking',
    ],
    // GMS eindprofiel: Verbinding 27%, Betekenis 26%, Plezier 24%, Groei 23% — gebalanceerd profiel
    gmsBenchmark: {
      hoog: 'Score ≥85%: Team heeft tocht volledig omarmd. Plan terugkijkmoment binnen 4 weken.',
      goed: 'Score 65–84%: Goede ervaring, Verbinding of Betekenis verdient aandacht. Bespreek CP4 na.',
      basis: 'Score <65%: Tocht technisch voltooid maar emotioneel niet geland. Eerst 1-op-1 check-in.',
    },
  })

  const [tour] = await sql`
    INSERT INTO tours (
      name,
      description,
      variant,
      created_by_id,
      is_published,
      estimated_duration_min,
      max_teams,
      pricing_model,
      price_per_person_cents,
      price_in_cents,
      ai_config
    ) VALUES (
      'Hoofddorp Ontdekt',
      'Van het oudste gebouw van Haarlemmermeer tot het kunstmatige meer aan de rand van de polder — Hoofddorp Ontdekt is een 2,5-uur GPS-speurtocht door de verborgen ziel van Hoofddorp. Teams ontdekken het Dik Trom-beeld, spreken een lokale ondernemer aan, vinden een geheime tuin en kraken een verborgen code bij het kanaal dat ooit alles veranderde. Eindig met een geluksmoment aan het water bij Restaurant Long Island. Volledig verhard, rolstoeltoegankelijk. Seizoen: jaar rond.',
      'wijktocht',
      ${spelleider.id},
      true,
      150,
      8,
      'per_person',
      4500,
      0,
      ${aiConfig}
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tour) {
    console.log('⚠️  Tour "Hoofddorp Ontdekt" bestaat al — sla over.')
    return
  }
  console.log(`✓ Tour aangemaakt: Hoofddorp Ontdekt (id: ${tour.id})`)

  // ─── Checkpoints ───────────────────────────────────────────────────────────
  //
  // GMS-gewichten zijn genormaliseerd op 40pt max per checkpoint (som van 4 dimensies),
  // verdeeld conform de percentages in het routedocument.
  // Totaal max GMS over 6 checkpoints: 240pt (excl. codekraker bonus CP5).
  //
  // ⚠️  GPS-verificatie vereist — coördinaten zijn kaartgebaseerd.
  //     Loop de route voor live-go en pas aan via Admin → Kaarteditor.

  const checkpoints = [
    {
      // ── Locatie 1 ─────────────────────────────────────────────────────────
      order: 0,
      name: 'Locatie 1 — Het Oude Raadhuis',
      description: [
        'LOCATIECONTEXT:',
        'Het Oude Raadhuis dateert uit 1867 — het oudste publieke gebouw in Hoofddorp. Nu trouwlocatie.',
        'In de voortuin staat het beeld "Liefdesboom" van Franz Bodner (vrouw houdt kind omhoog).',
        'Contrast tussen 19e-eeuws gebouw en moderne kantooromgeving is het thema van de openingsmissie.',
        '',
        'DOEL VAN DEZE MISSIE:',
        'Activeren, iedereen aan boord halen, eerste gezamenlijk moment creëren. Geen zware vragen.',
        '',
        'AI-BEOORDELINGSRUBRIC (4 criteria × max 3pt = 12pt max):',
        '1. Aanwezigheid (0-3): Zijn alle teamleden zichtbaar?',
        '   0=<helft | 1=>helft maar niet iedereen | 2=iedereen aanwezig maar passief | 3=iedereen actief betrokken',
        '2. Intentie (0-3): Communiceert het beeld iets zonder woorden?',
        '   0=standaard groepsfoto | 1=poging tot idee, onduidelijk | 2=herkenbaar idee | 3=sterk, voelbaar beeld',
        '3. Omgeving (0-3): Maakt team gebruik van gebouw/tuin/beeld?',
        '   0=alleen mensen | 1=omgeving op achtergrond | 2=bewuste relatie tot omgeving | 3=gebouw integraal',
        '4. Spontaniteit (0-3): Voelt de foto echt of geposeerd?',
        '   0=volledig stijf | 2=mix | 3=levendig, energiek, zichtbaar plezier',
        '',
        'GMS: Plezier 40% | Verbinding 35% | Betekenis 15% | Groei 10%',
      ].join('\n'),
      type: 'kennismaking',
      lat: 52.3024,
      lng: 4.6902,
      missionTitle: '📸 Jullie eerste moment — Het Raadhuis 1867',
      missionDesc: `Welkom in Hoofddorp. Voor jullie staat een gebouw uit 1867 — het oudste publieke gebouw van de gemeente. Hier werden vroeger huwelijken gesloten en besluiten genomen die de polder vormgaven.

Jullie eerste missie: maak een groepsfoto waarbij het team laat zien wat jullie als groep vandaag hebben meegebracht. Geen woorden op de foto. Geen tekst in beeld. Alleen een beeld.

Denk niet te lang na. Jullie hebben 5 minuten.`,
      missionType: 'foto',
      connection: 14,
      meaning: 6,
      joy: 16,
      growth: 4,
      hint1: 'Kijk goed naar de voortuin — er staat een beeld. Gebruik het als onderdeel van jullie compositie.',
      hint2: 'Geen woorden, geen tekst. Denk in poses, in afstand, in hoe jullie ten opzichte van het gebouw staan.',
      hint3: 'Zet iemand centraal die "het meeste heeft meegebracht" — de rest bouwt de foto om hem of haar heen.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },

    {
      // ── Locatie 2 ─────────────────────────────────────────────────────────
      order: 1,
      name: 'Locatie 2 — Dik Tromplein',
      description: [
        'LOCATIECONTEXT:',
        'Dik Trom-beeld (1973, Nico Onkenhout): achterstevoren op een bokkende ezel, trekt hem bij de staart.',
        'Personage van C.J. Kieviet (Hoofddorpse onderwijzer, eind 19e eeuw) — dikke goedlachse jongen met avonturen.',
        'Iconisch voor Hoofddorp, maar de meeste dagelijkse passanten kennen het verhaal niet.',
        '',
        'DOEL VAN DEZE MISSIE:',
        'Lichaam activeren + samenwerking. Het grappige beeld geeft toestemming om ook gek te doen.',
        '',
        'AI-BEOORDELINGSRUBRIC (4 criteria × max 3pt = 12pt max):',
        '1. Uitvoering (0-3): Is het tableau herkenbaar als recreatie van het beeld?',
        '   0=geen poging | 1=vaag vergelijkbaar | 2=herkenbaar, elementen aanwezig | 3=nauwkeurig en creatief',
        '2. Participatie (0-3): Doet het hele team mee?',
        '   0=<helft actief | 2=iedereen meedoet | 3=iedereen volledig fysiek betrokken',
        '3. Energie (0-3): Is de groep zichtbaar aan het genieten?',
        '   0=stijf/ongemakkelijk | 2=gemoedelijk | 3=luid/enthousiast, onmiskenbaar plezier',
        '4. Tijdsgebruik (0-3): Hebben ze de 10 seconden volledig gebruikt?',
        '   0=<5sec, afgebroken | 2=volledig maar weinig beweging | 3=volledig, dynamisch, in de flow',
        '',
        'GMS: Plezier 50% | Verbinding 30% | Groei 15% | Betekenis 5%',
      ].join('\n'),
      type: 'samenwerking',
      lat: 52.3019,
      lng: 4.6894,
      missionTitle: '🎭 Het levende tableau — Dik Trom 1973',
      missionDesc: `Voor jullie staat Dik Trom. Hij is achterstevoren op een ezel gaan zitten — en trekt hem aan de staart. Dik Trom deed altijd wat anderen niet deden.

Jullie opdracht is in twee delen:

DEEL 1 — De pose:
Maak als team een levend tableau: reproduceer het beeld van Dik Trom zo nauwkeurig mogelijk met jullie eigen lichamen. Iemand speelt de ezel. Iemand zit achterstevoren. Iemand trekt. Film het — 10 seconden. Klaar.

DEEL 2 — De vraag:
Dik Trom is bedacht door een Hoofddorpse leraar die hier woonde en werkte. Bespreek met je team: wie in jullie organisatie is de 'Dik Trom'? Wie doet altijd wat anderen niet durven? Schrijf de naam op — maar stuur hem niet in. Onthoud hem voor locatie 6.`,
      missionType: 'video',
      connection: 12,
      meaning: 2,
      joy: 20,
      growth: 6,
      hint1: 'Iemand op handen en knieën als ezel, iemand zit er achterstevoren op en grijpt naar de "staart". Minstens 3 personen actief.',
      hint2: 'De 10 seconden tellen — zorg dat de camera loopt vóórdat jullie beginnen, niet erna.',
      hint3: 'Geen perfectie nodig. Luid en enthousiast telt meer dan nauwkeurig. De AI beloont energie.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },

    {
      // ── Locatie 3 ─────────────────────────────────────────────────────────
      order: 2,
      name: 'Locatie 3 — De Kruisweg Ondernemer',
      description: [
        'LOCATIECONTEXT:',
        'De Kruisweg is de hoofdwinkelstraat van Hoofddorp. Naast grote ketens zitten er kleine lokale ondernemers',
        'die de ziel van Hoofddorp bepalen — bakker, kapper, bloemist, boekhandel.',
        '',
        'SPELLEIDER-INSTRUCTIE:',
        'Loop de Kruisweg vooraf en noteer 2-3 specifieke lokale winkels die het best geschikt zijn.',
        'Voeg ze toe als suggestie in de App via de kaarteditor (hint3) zodat teams niet te lang zoeken.',
        'De missietekst werkt ook zonder vaste winkelnaam — teams kiezen zelf.',
        '',
        'AI-BEOORDELINGSRUBRIC (4 criteria × max 3pt = 12pt max):',
        '1. Aanwezigheid ondernemer (0-3): Is er een foto MET de ondernemer?',
        '   0=geen foto/alleen winkel | 2=foto met ondernemer maar afstandelijk | 3=ondernemer blij en bereid',
        '2. Reflectiezin (0-3): Kwaliteit van "wat raakte ons het meest?"',
        '   0=vaag/nietszeggend | 1=parafrase van ondernemer | 2=concreet detail + eigenwoord | 3=uniek voor dit team',
        '3. Moed (0-3): Zijn ze echt naar binnen gegaan?',
        '   0=geen foto/buiten | 1=foto op drempel | 3=duidelijk binnengegaan, winkelomgeving zichtbaar',
        '4. Doorvraag (0-3): Is er een detail dat alleen via doorvragen verkregen kon zijn?',
        '   0=geen detail | 1=oppervlakkig detail | 2=concreet verhaal/naam/jaar | 3=onverwacht, niet voor de hand liggend',
        '',
        'GMS: Betekenis 45% | Verbinding 35% | Plezier 10% | Groei 10%',
      ].join('\n'),
      type: 'actie',
      lat: 52.3016,
      lng: 4.6904,
      missionTitle: '🏪 De lokale ondernemer — Kruisweg',
      missionDesc: `Jullie staan op de Kruisweg — de hoofdstraat van Hoofddorp. Hier lopen dagelijks duizenden mensen voorbij op weg naar hun werk, hun trein, hun volgende meeting.

Jullie missie: zoek een lokale ondernemer. Geen keten. Geen franchise. Iemand die hier al meer dan vijf jaar zit en de straat kent.

Ga naar binnen. Stel jezelf voor als team. Vertel wat jullie vandaag doen. Stel dan deze twee vragen:

Vraag 1: "Wat is het mooiste moment dat u ooit heeft meegemaakt in deze winkel?"
Vraag 2: "Wat wilt u dat meer mensen weten over dit werk?"

Luister écht. Stel ten minste één doorvraag. Maak daarna — met uitdrukkelijke toestemming — een foto samen voor of in de winkel.

Schrijf na afloop in één zin op: wat raakte jullie het meest? Stuur de foto én de zin in.`,
      missionType: 'foto',
      connection: 14,
      meaning: 18,
      joy: 4,
      growth: 4,
      hint1: 'Geen keten, geen franchise. Zoek een bakker, boekhandel, bloemist, kapper of speciaalzaak.',
      hint2: 'Begin met: "Wij doen vandaag een stadstocht en spreken lokale ondernemers aan. Mag ik u iets vragen?"',
      hint3: 'Tip van de spelleider: [VOEGHIER2-3WINKELSNAMEN in via de kaarteditor na het lopen van de route]',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },

    {
      // ── Locatie 4 ─────────────────────────────────────────────────────────
      order: 3,
      name: 'Locatie 4 — De Bijbelse Tuin',
      description: [
        'LOCATIECONTEXT:',
        'Kleine verborgen tuin achter de RK-Kerk Johannes de Doper aan de Kruisweg.',
        'Planten uit Bijbelse verhalen: vijgenbomen, granaatappels, olijfbomen, druiven.',
        'Meeste Hoofddorpenaren die dagelijks voorbij de kerk lopen weten niet dat hij bestaat.',
        '',
        'SPELLEIDER-INSTRUCTIE:',
        'Verifieer of de tuin vrij toegankelijk is op werkdagen (open ma–za overdag).',
        'Voeg openingstijden toe als waarschuwing in app. Plan alternatief bij sluiting.',
        '',
        'AI-BEOORDELINGSRUBRIC (4 criteria × max 3pt = 12pt max):',
        '1. Volledigheid (0-3): Heeft iedereen een antwoord gegeven?',
        '   0=1-2 antwoorden | 2=>helft aanwezig | 3=iedereen, ook al is het kort',
        '2. Specificiteit (0-3): Zijn de antwoorden concreet?',
        '   AI zoekt eigennamen, locaties, specifieke momenten, citaten.',
        '   0=vaag | 1=één concreet element per antwoord | 2=meeste bevatten specifiek detail | 3=elk antwoord uniek',
        '3. Diversiteit (0-3): Zeggen verschillende mensen verschillende dingen?',
        '   0=iedereen noemt hetzelfde | 1=enige variatie | 2=duidelijke diversiteit | 3=elk antwoord een andere kant',
        '4. Eerlijkheid (0-3): Zijn dit antwoorden die mensen normaal niet geven in professionele setting?',
        '   0=volledig sociaal wenselijk | 1=één persoonlijk antwoord | 2=meerdere kwetsbare elementen | 3=onverwacht',
        '',
        'GMS: Verbinding 40% | Betekenis 35% | Groei 20% | Plezier 5%',
        '',
        'Let op: dit is de rustmissie. Plezier scoort bewust laag — dat is de bedoeling.',
      ].join('\n'),
      type: 'reflectie',
      lat: 52.3032,
      lng: 4.6897,
      missionTitle: '🌿 De verborgen tuin — 60 seconden stilte',
      missionDesc: `Jullie staan in een tuin die de meeste mensen in Hoofddorp nooit hebben gezien — ook al lopen ze er dagelijks langs. Hij bestaat al decennia. Niemand zoekt hem. Hij wacht gewoon.

Ga zitten. Doe even niets. 60 seconden. Kijk rond.

Daarna beantwoordt iedereen reihum — niet overslaan — deze vraag:

"Wat was voor jou het onverwachtste moment van vandaag tot nu toe?"

Niet het leukste. Niet het moeilijkste. Het meest onverwachte.

Eén persoon schrijft alle antwoorden kort op en stuurt ze in als tekstbericht. Geen samenvatting — schrijf letterlijk wat iedereen zei.`,
      missionType: 'opdracht',
      connection: 16,
      meaning: 14,
      joy: 2,
      growth: 8,
      hint1: 'De Bijbelse Tuin ligt direct achter de RK-kerk aan de Kruisweg. Loop om de kerk heen via de zijkant.',
      hint2: 'Is de tuin dicht? Kijk of er een bordje is met openingstijden. Spelleider heeft een alternatieve locatie.',
      hint3: 'Echt 60 seconden stilte — zet een timer. De antwoorden daarna zijn altijd rijker dan zonder.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },

    {
      // ── Locatie 5 ─────────────────────────────────────────────────────────
      order: 4,
      name: 'Locatie 5 — De Hoofdvaart',
      description: [
        'LOCATIECONTEXT:',
        'De Hoofdvaart werd gegraven in 1853 als eerste stap in de drooglegging van het Haarlemmermeer (36 km lang).',
        'Zonder dit kanaal: geen Hoofddorp, geen Schiphol, geen gemeente. Geen monument, geen bordje — gewoon water.',
        '',
        'SPELLEIDER-INSTRUCTIE — VERBORGEN CODE:',
        'Dit is een kritiek actiepunt: de verborgen code in Stap 2 MOET ter plekke worden bepaald.',
        'Zoek op de locatie een getal dat teams kunnen vinden maar niet voor de hand ligt. Mogelijkheden:',
        '- Bouwjaar op een brug of sluisconstructie',
        '- Aantal brugpalen aan één zijde',
        '- Eerste twee cijfers van een gemaalplaat of peilbordje',
        '- Aantal bomen op een bepaalde strook oever',
        'Noteer het juiste antwoord en sla het op als quizantwoord in de admin. Pas hint3 aan naar de vindplaats.',
        '',
        'CODEKRAKER BONUSPUNTEN (automatisch):',
        'Eerste team correct: 5 bonuspunten (bonusPhotoPoints=5)',
        'Correct maar niet eerste: 3 bonuspunten (handmatig toe te kennen via admin)',
        'Fout antwoord: 0 punten',
        '',
        'AI-BEOORDELINGSRUBRIC Stap 1 — Metafoor (2 criteria × max 3pt = 6pt):',
        '1. Metafoor-kwaliteit (0-3): Maakt het team de verbinding kanaal ↔ organisatie?',
        '   0=geen verbinding | 1=vaag | 2=herkenbare parallel | 3=sterk, had in jaarverslag gekund',
        '2. Concreetheid (0-3): Specifiek voor déze organisatie of generiek?',
        '   0=generiek ("samenwerking", "innovatie") | 1=één specifiek element | 2=herkenbaar als dit team | 3=uniek',
        '',
        'GMS: Groei 50% | Plezier 30% | Betekenis 15% | Verbinding 5%',
      ].join('\n'),
      type: 'samenwerking',
      lat: 52.3048,
      lng: 4.6871,
      missionTitle: '🌊 De Hoofdvaart — het kanaal dat alles veranderde',
      missionDesc: `Jullie staan aan het water. Dit kanaal heet de Hoofdvaart. Het werd gegraven in 1853 — als allereerste stap om het Haarlemmermeer droog te leggen. Zonder dit kanaal was hier nu nog een meer. Geen Hoofddorp. Geen Schiphol. Geen polder.

Jullie missie is in twee stappen:

STAP 1 — De vraag:
Bespreek als team: als jullie organisatie over 36 jaar wordt "drooggelegd" — wat is dan het kanaal dat het fundament legt? Wat is de ene beslissing die alles verandert?
Schrijf in één zin jullie antwoord op en stuur het in.

STAP 2 — De code:
Op deze locatie is een getal verborgen in de omgeving. Niet op je telefoon opzoeken. Niet raden. Kijk goed. Jullie hebben 4 minuten om het te vinden en in te voeren bij jullie antwoord. Het team dat het als eerste correct invult krijgt 5 bonuspunten.`,
      missionType: 'opdracht',
      connection: 2,
      meaning: 6,
      joy: 12,
      growth: 20,
      hint1: 'Kijk goed naar permanente objecten op de locatie: bruggen, sluizen, palen, peilbordjes. Het getal staat ergens vast.',
      hint2: 'Geen googlen — alleen eigen ogen. Het getal is zichtbaar vanaf de oever zonder speciale toegang.',
      hint3: '[SPELLEIDER: pas deze hint aan na het lopen van de route — beschrijf de exacte vindplaats van de code]',
      timeLimitSeconds: 240, // 4 minuten voor de codekraker
      bonusPhotoPoints: 5,   // eerste team correct → 5 bonuspunten
    },

    {
      // ── Locatie 6 ─────────────────────────────────────────────────────────
      order: 5,
      name: 'Locatie 6 — Toolenburgerplas',
      description: [
        'LOCATIECONTEXT:',
        'De Toolenburgerplas is een kunstmatig meer (zandwinning voor Toolenburg/Floriande), pas in 2003 opengesteld.',
        'Aan de oever staat een broedplaatsenmuur voor oeverzwaluwen.',
        'Restaurant Long Island biedt terras met zicht op het water — ideale finishlocatie.',
        '',
        'SPELLEIDER-INSTRUCTIE:',
        'Plan de afsluiting zo dat teams aansluitend kunnen plaatsnemen bij Long Island of vergelijkbare locatie.',
        'De nabespreking vindt LIVE plaats — niet via de app. Dit is de menselijke afsluiting.',
        '',
        'AI-BEOORDELINGSRUBRIC (4 criteria × max 3pt = 12pt max):',
        '1. Kwaliteit geluksmomenten (0-3): Zijn ze specifiek en persoonlijk?',
        '   0=vaag/generiek | 1=één concreet moment | 2=>helft specifiek | 3=elk teamlid uniek, alleen dit team',
        '2. Emotionele lading (0-3): Bevatten antwoorden emotie — vreugde, verrassing, ontroering, dankbaarheid?',
        '   0=volledig functioneel | 1=één antwoord met emotie | 2=meerdere | 3=geheel heeft emotionele diepgang',
        '3. Diversiteit geluksmomenten (0-3): Benoemt iedereen een ander moment?',
        '   0=iedereen hetzelfde | 1=2-3 verschillend | 2=>3 verschillend | 3=elk geluksmoment uniek',
        '4. Slotfoto (0-3): Kwaliteit als menselijk document.',
        '   0=standaard niemand kijkt dezelfde kant | 1=enige cohesie | 2=warm, herkenbaar gedeeld | 3=echt moment',
        '',
        'GMS: Plezier 30% | Verbinding 30% | Betekenis 25% | Groei 15%',
        '',
        'Note: Onderdeel 2 (Dik Trom-moment) wordt NIET via de app beoordeeld — dat is een live team-moment.',
        'De slotfoto wordt wel ingezonden en verschijnt in het GMS-rapport.',
      ].join('\n'),
      type: 'feest',
      lat: 52.2996,
      lng: 4.6802,
      missionTitle: '🏁 Het geluksmoment — Toolenburgerplas',
      missionDesc: `Jullie zijn er. Dit meer bestaat pas 22 jaar — maar het ziet eruit alsof het er altijd al was. Dat is het mooie aan goed ontwerp: het valt niet op.

Jullie laatste missie heeft drie onderdelen:

ONDERDEEL 1 — Het geluksmoment:
Iedereen beantwoordt reihum, hardop: "Wat was jouw geluksmoment van vandaag?"
Niet het leukste. Niet het grappigste. Het moment waarop jij voelde: dit is waarom ik hier ben.
Schrijf alle antwoorden op en stuur ze in.

ONDERDEEL 2 — De Dik Trom:
Weet je nog wie jullie eerder hebben benoemd? Degene die doet wat anderen niet durven?
Die persoon krijgt nu het woord. Niet om iets te doen — maar om te horen wat het team in hem of haar waardeert.
Iedereen zegt één zin. Die persoon zegt niets terug. Alleen luisteren.

ONDERDEEL 3 — De foto die telt:
Maak één laatste groepsfoto. Niet voor het platform. Niet voor punten. Voor jullie.
Stuur hem daarna toch in — maar weet: dit is de foto die in jullie GMS-rapport staat.`,
      missionType: 'foto',
      connection: 12,
      meaning: 10,
      joy: 12,
      growth: 6,
      hint1: 'Restaurant Long Island ligt aan de noordoever van de Toolenburgerplas. Loop het pad langs het water.',
      hint2: 'De oeverzwaluwenmuur is een betonnen broedwand met honderden holtes — een onverwacht bouwwerk aan het water.',
      hint3: 'Neem de tijd voor Onderdeel 2. Het Dik Trom-moment is het stilste én krachtigste deel van de hele tocht.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
  ]

  for (const cp of checkpoints) {
    await sql`
      INSERT INTO checkpoints (
        tour_id,
        order_index,
        name,
        description,
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
        ${cp.order},
        ${cp.name},
        ${cp.description},
        ${cp.type},
        ${cp.lat},
        ${cp.lng},
        50,
        ${cp.missionTitle},
        ${cp.missionDesc},
        ${cp.missionType},
        ${cp.connection},
        ${cp.meaning},
        ${cp.joy},
        ${cp.growth},
        ${cp.hint1},
        ${cp.hint2},
        ${cp.hint3},
        ${cp.timeLimitSeconds},
        ${cp.bonusPhotoPoints},
        false
      )
    `
    console.log(`  ✓ CP${cp.order + 1}: ${cp.name} [${cp.lat}, ${cp.lng}]`)
  }

  // ─── Demo sessie ───────────────────────────────────────────────────────────
  const [session] = await sql`
    INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
    VALUES (${tour.id}, ${spelleider.id}, 'lobby', 'HDRD01', 'wijktocht')
    ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
    RETURNING id
  `
  console.log(`\n✓ Demo sessie aangemaakt: HDRD01 (id: ${session.id})`)

  // ─── Demo teams ────────────────────────────────────────────────────────────
  const teams = [
    { name: 'Team Raadhuis',     token: 'token-hd-raadhuis-01' },
    { name: 'Team Polder',       token: 'token-hd-polder-02' },
    { name: 'Team Toolenburg',   token: 'token-hd-toolenburg-03' },
  ]
  for (const team of teams) {
    await sql`
      INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
      VALUES (${session.id}, ${team.name}, ${team.token}, 0)
      ON CONFLICT (team_token) DO NOTHING
    `
    console.log(`  ✓ Team: ${team.name}`)
  }

  // ─── Samenvatting ──────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Hoofddorp Ontdekt succesvol aangemaakt!

📍  Route
    Start:    Oude Raadhuis, Kruisweg 103, Hoofddorp
    Einde:    Toolenburgerplas, Restaurant Long Island
    Afstand:  ±4,5 km — volledig verhard, rolstoeltoegankelijk
    Duur:     150 min (excl. nabespreking)
    Variant:  WijkTocht
    Prijs:    €45 p.p. excl. BTW

🗺️  Checkpoints
    CP1  52.3024, 4.6902  — Oude Raadhuis (kennismaking / foto)
    CP2  52.3019, 4.6894  — Dik Tromplein (samenwerking / video)
    CP3  52.3016, 4.6904  — Kruisweg Ondernemer (actie / foto)
    CP4  52.3032, 4.6897  — Bijbelse Tuin (reflectie / opdracht)
    CP5  52.3048, 4.6871  — Hoofdvaart (samenwerking / opdracht + code)
    CP6  52.2996, 4.6802  — Toolenburgerplas (feest / foto)

🎮  Demo sessie
    Joincode:  HDRD01
    Teams:     Team Raadhuis | Team Polder | Team Toolenburg

⚠️  VERPLICHTE ACTIES VOOR LIVE-GO:
    1. Loop de route volledig door en verifieer GPS-ankerpunten
    2. Bepaal de verborgen code bij de Hoofdvaart (CP5)
       → Pas hint3 van CP5 aan en stel het juiste antwoord in
    3. Bevestig openingstijden Bijbelse Tuin (ma–za overdag)
       → Voeg waarschuwing toe in hint2 van CP4 indien nodig
    4. Noteer 2-3 lokale ondernemers op de Kruisweg
       → Pas hint3 van CP3 aan met winkelnamen en adressen
    5. Contracteer Long Island of alternatieve horecapartner voor de finish

📊  GMS-profiel (max 240pt excl. codekraker bonus):
    Verbinding  14+12+14+16+2+12  = 70pt  (29%)
    Betekenis    6+2+18+14+6+10   = 56pt  (23%)
    Plezier     16+20+4+2+12+12   = 66pt  (28%)
    Groei        4+6+4+8+20+6     = 48pt  (20%)

📱  Testen:
    1. Log in als ${spelleiderEmail}
    2. Ga naar /spelleider/sessies en start sessie HDRD01
    3. Teams joinen via /join → code HDRD01
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed().catch((e) => {
  console.error('❌ Seeder fout:', e)
  process.exit(1)
})
