/**
 * Seeder: VaarTocht — Sloeptocht over de Kaag (Kagerplassen)
 *
 * Gebruik:
 *   bun scripts/seed-vaartocht.ts [spelleider-email]
 *
 * Voorbeeld:
 *   bun scripts/seed-vaartocht.ts spelleider@impacttocht.nl
 *
 * Route: start/finish Jachthaven Jonkman (Jachthaven 1, 2172 JX Sassenheim),
 * ~12,5 km over de Kagerplassen langs molen De Kager, Kaageiland,
 * de Zwanburgermolen, Koudenhoorn/Warmond en 't Joppe. Max. 4 uur varen
 * met een sloep (~2u varen + ~1u missies + marge).
 *
 * De coördinaten zijn echte waypoints (OSM/Wikipedia-geverifieerd) — de
 * spelleider kan ze fine-tunen via de kaarteditor (bv. exacte aanlegsteiger).
 * Unlock-radius is ruimer dan te voet (75-150 m) omdat teams op het water
 * niet exact op een punt kunnen stilliggen.
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seedVaarTocht() {
  const spelleiderEmail = process.argv[2] || 'spelleider@impacttocht.nl'

  console.log('\n⛵ Seeding VaarTocht — Sloeptocht de Kaag...\n')
  console.log(`  Spelleider: ${spelleiderEmail}`)

  const [spelleider] = await sql`
    SELECT id FROM users WHERE email = ${spelleiderEmail} LIMIT 1
  `
  if (!spelleider) {
    console.error(`\n❌ Spelleider '${spelleiderEmail}' niet gevonden in de database.`)
    console.error('   Voer eerst de basis-seed uit: bun scripts/seed.ts\n')
    process.exit(1)
  }

  // ─── Tour aanmaken ───────────────────────────────────────────────────────────
  const storyFrame = {
    introText:
      'Vandaag is jullie sloep jullie teamkamer. Geen vergadertafel, geen agenda — alleen water, wind en elkaar. De Kagerplassen bewaren al eeuwen de verhalen van molenaars, eilandbewoners en schippers. Ontdek ze samen, checkpoint voor checkpoint. Maar let op: op het water bereik je niets alleen.',
    finaleReveal:
      'Jullie meerden af als collega\'s, vrienden of familie — jullie leggen aan als bemanning. De Kaag heeft jullie laten zien wat een team op het water leert: koers houden doe je samen, en de mooiste momenten vind je als je de motor durft uit te zetten.',
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
      story_frame,
      ai_config
    ) VALUES (
      'VaarTocht — Sloeptocht de Kaag',
      'GPS-vaartocht per sloep over de Kagerplassen, start en finish bij Jachthaven Jonkman in Sassenheim. In maximaal 4 uur varen jullie langs eeuwenoude poldermolens, het autovrije Kaageiland, het zwemeiland Koudenhoorn en de stilte van het open water. Onderweg ontgrendel je checkpoints via GPS en voltooi je missies die het team dichter bij elkaar brengen. Geen vaarbewijs nodig — sloepen zijn te huur bij de jachthaven.',
      'vaartocht',
      ${spelleider.id},
      true,
      240,
      4,
      9500,
      'per_person',
      1250,
      ${JSON.stringify(storyFrame)},
      ${JSON.stringify({
        targetGroup: 'universeel — zakelijke teams, families en vriendengroepen',
        teamSize: 6,
        themes: ['varen', 'water', 'molens', 'natuur', 'samenwerking'],
        location: 'Kagerplassen — start Jachthaven Jonkman, Jachthaven 1, 2172 JX Sassenheim',
        generatedAt: new Date().toISOString(),
      })}
    ) RETURNING id
  `

  console.log(`✓ Tour aangemaakt: VaarTocht (id: ${tour.id})`)

  // ─── Checkpoints ─────────────────────────────────────────────────────────────
  // Echte coördinaten (OSM/Wikipedia), route met de klok mee rond de Kagerplassen.
  const checkpoints = [
    {
      orderIndex: 0,
      name: 'Checkpoint 1 — Loskomen van de wal',
      type: 'kennismaking',
      missionTitle: '⚓ Bemanning aan boord',
      missionDescription:
        'Voordat jullie losgooien: elke sloep heeft een bemanning nodig. Verdeel de rollen — schipper (vaart), navigator (leest de kaart en deze app), fotograaf (legt alles vast) en verhalenverteller (vat elk checkpoint samen in één zin). Doop daarna jullie sloep: bedenk samen een naam die bij dit team past en roep hem hardop over de haven. Schrijf de rolverdeling en de scheepsnaam in het antwoord — en waarom deze naam bij jullie past.',
      missionType: 'opdracht',
      lat: 52.2199,
      lng: 4.5459,
      unlockRadius: 75,
      gmsConnection: 25,
      gmsMeaning: 5,
      gmsJoy: 10,
      gmsGrowth: 5,
      hint1: 'Kies de schipper niet op ervaring maar op rust — en wissel gerust halverwege.',
      hint2: 'Een goede scheepsnaam zegt iets over jullie team, niet over de boot.',
      hint3: 'Twijfel over de naam? Laat iedereen er één roepen en stem met handen in de lucht.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 1,
      name: 'Checkpoint 2 — Molen De Kager (1683)',
      type: 'samenwerking',
      missionTitle: '🌬️ De motor van de polder',
      missionDescription:
        'Voor jullie draait molen De Kager, een wipmolen uit 1683 die de Kagerpolder ruim drie eeuwen droog hield — tot 1985 was hij de hoofdbemaling van het eiland. Vaar langzaam langs en beantwoord samen: 1) Waarom staat deze molen precies HIER, aan de rand van het water? 2) Schat als team hoeveel liter water zo\'n molen per minuut wegpompt — overleg en kies één getal. 3) Wat is de "molen" van jullie eigen team: wat houdt bij jullie stilletjes alles draaiende?',
      missionType: 'quiz',
      lat: 52.2131,
      lng: 4.5719,
      unlockRadius: 120,
      gmsConnection: 5,
      gmsMeaning: 15,
      gmsJoy: 5,
      gmsGrowth: 20,
      hint1: 'Een poldermolen pompt water van laag (de polder) naar hoog (de plas) — kijk waar de sloot de plas raakt.',
      hint2: 'Een wipmolen verzet tienduizenden liters per minuut — denk groter dan een badkuip.',
      hint3: 'Vraag 3 heeft geen fout antwoord: wie of wat bij jullie onopvallend het werk doet, dát is de molen.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 50,
    },
    {
      orderIndex: 2,
      name: 'Checkpoint 3 — Kaageiland',
      type: 'actie',
      missionTitle: '🛥️ Het eiland zonder brug',
      missionDescription:
        'Leg aan bij het dorp Kaag — het enige echte eilanddorp van de Kagerplassen, alleen bereikbaar per pontje of boot. Ga aan land en zoek het verhaal van dit eiland: praat met een eilandbewoner, een pontschipper of iemand op een terras. Vraag: "Wat is het beste én het lastigste aan wonen op een eiland?" Maak een teamfoto op het eiland met iets typisch Kaags op de achtergrond (het pontje, de kerk, het kaasmuseum De Kaagse Boer). Jullie hebben 15 minuten aan land — de verhalenverteller vat het antwoord van de eilander samen.',
      missionType: 'foto',
      lat: 52.2133,
      lng: 4.5583,
      unlockRadius: 100,
      gmsConnection: 20,
      gmsMeaning: 10,
      gmsJoy: 15,
      gmsGrowth: 5,
      hint1: 'Aanleggen mag bij de passantensteiger bij het dorp — de schipper legt aan, de rest houdt de steiger vast.',
      hint2: 'Begin met: "Wij doen een vaartocht met opdrachten — mag ik u één vraag stellen?" Werkt bijna altijd.',
      hint3: 'Geen bewoner te vinden? Het personeel van een terras of het pontje telt ook — die kennen het eiland het best.',
      timeLimitSeconds: 900,
      bonusPhotoPoints: 50,
    },
    {
      orderIndex: 3,
      name: 'Checkpoint 4 — Zwanburgermolen (1805)',
      type: 'samenwerking',
      missionTitle: '🏝️ De molenaar op het eiland',
      missionDescription:
        'Jullie varen nu langs de Zwanburgermolen, een ronde stenen molen uit 1805 op de Zwanburgerpolder — een eiland dat je alléén over water kunt bereiken. Generaties molenaarsgezinnen woonden hier: geen weg, geen winkel, elke boodschap per roeiboot. Motor even in z\'n vrij en overleg als team: wat zou dit eilandleven van een gezin gevraagd hebben — en wat zou het gegéven hebben? Formuleer samen één antwoord in maximaal vijf zinnen, waarin elk teamlid één gedachte heeft bijgedragen.',
      missionType: 'opdracht',
      lat: 52.1983,
      lng: 4.5128,
      unlockRadius: 150,
      gmsConnection: 5,
      gmsMeaning: 25,
      gmsJoy: 5,
      gmsGrowth: 10,
      hint1: 'Denk praktisch (school, eten, storm) én menselijk (stilte, samen zijn, vrijheid).',
      hint2: 'Laat iedereen eerst 30 seconden zelf nadenken voordat jullie gaan praten — dat levert rijkere antwoorden op.',
      hint3: 'De mooiste antwoorden verbinden toen met nu: wat van dat eilandleven zou jullie team goed doen?',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 4,
      name: 'Checkpoint 5 — Koudenhoorn & Warmond',
      type: 'feest',
      missionTitle: '🎬 De Kaag-filmpremière',
      missionDescription:
        'Jullie liggen bij Koudenhoorn, het zwemeiland van Warmond — met het beschermde dorpsgezicht van Warmond als decor. Tijd voor de leukste missie van de dag: maak een video van maximaal 30 seconden waarin jullie team de Kaag "verkoopt" alsof het een wereldberoemde filmlocatie is. Denk: dramatische voice-over, slow-motion op de voorplecht, de wind in de haren. Iedereen komt in beeld. Durvers mogen (veilig, bij het strandje!) een voet in het water zetten voor de opname.',
      missionType: 'video',
      lat: 52.1916,
      lng: 4.5059,
      unlockRadius: 120,
      gmsConnection: 10,
      gmsMeaning: 0,
      gmsJoy: 25,
      gmsGrowth: 5,
      hint1: 'Kies één regisseur die de shots bepaalt — dat scheelt tien minuten discussie.',
      hint2: 'Een goede trailer heeft drie shots: het landschap, het team, de held (jullie sloep).',
      hint3: 'Overdrijven is het hele punt. Hoe serieuzer de voice-over, hoe grappiger het resultaat.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 50,
    },
    {
      orderIndex: 5,
      name: "Checkpoint 6 — Stilte op 't Joppe",
      type: 'reflectie',
      missionTitle: '🌾 Motor uit',
      missionDescription:
        'Jullie zijn op \'t Joppe, open water tussen rietkragen en weilanden. De missie is simpel en zeldzaam: zet de motor uit. Drie minuten lang zegt niemand iets — alleen water, wind, rietzangers en de verte. Laat de sloep drijven. Daarna beantwoordt ieder teamlid één vraag: "Wat neem jij van dit water mee terug naar de wal?" De verhalenverteller schrijft alle antwoorden op — één zin per persoon, niets samenvatten, elk antwoord telt.',
      missionType: 'opdracht',
      lat: 52.203,
      lng: 4.519,
      unlockRadius: 150,
      gmsConnection: 10,
      gmsMeaning: 15,
      gmsJoy: 0,
      gmsGrowth: 20,
      hint1: 'Drie minuten stilte voelt lang — dat is precies de bedoeling. Zet een timer en leg de telefoons daarna weg.',
      hint2: 'Kijk tijdens de stilte elk een andere kant op. Je ziet meer als niemand hetzelfde ziet.',
      hint3: 'Geen goede antwoorden nodig — eerlijke antwoorden. "Rust" is prima. "Dat ik te weinig stil ben" is beter.',
      timeLimitSeconds: null,
      bonusPhotoPoints: 0,
    },
    {
      orderIndex: 6,
      name: 'Checkpoint 7 — Thuishaven',
      type: 'feest',
      missionTitle: '🏆 Aanleggen als bemanning',
      missionDescription:
        'Jullie varen de haven van Jachthaven Jonkman weer binnen — niet als de groep die vertrok, maar als bemanning. Laatste missie: leg perfect aan (schipper stuurt, de rest werkt samen met landvasten en stootwillen) en maak dé teamfoto van de dag op de steiger, met de sloep en de Kaag op de achtergrond. Beschrijf in het antwoord: welk moment van vandaag vergeten jullie niet — en welke rol verdient de titel "MVP van het water"?',
      missionType: 'foto',
      lat: 52.2199,
      lng: 4.5459,
      unlockRadius: 75,
      gmsConnection: 15,
      gmsMeaning: 5,
      gmsJoy: 15,
      gmsGrowth: 5,
      hint1: 'Aanleggen zonder stress: langzaam varen, rustig praten, één iemand geeft aanwijzingen.',
      hint2: 'De beste teamfoto is niet de netste — de vieringen na een gelukte aanlegmanoeuvre zijn goud.',
      hint3: 'Kunnen jullie niet kiezen wie MVP is? Dan is het antwoord "de bemanning" — en dat is ook punten waard.',
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
        true
      )
    `
    console.log(`  ✓ CP${cp.orderIndex + 1}: ${cp.name}`)
  }

  console.log(`
✅ VaarTocht succesvol aangemaakt!

   Tour ID: ${tour.id}
   Variant: vaartocht
   Prijs: €12,50 p.p. (per_person)
   Route: Jachthaven Jonkman → De Kager → Kaageiland → Zwanburgermolen
          → Koudenhoorn/Warmond → 't Joppe → Jachthaven Jonkman (~12,5 km)

   Coördinaten zijn echte waypoints — fine-tune de exacte aanlegplekken
   via de kaarteditor: /spelleider/tochten/${tour.id}/checkpoints

   Praktisch: sloepen huren kan bij Jachthaven Jonkman (geen vaarbewijs
   nodig, min. 25 jaar). Zwemvesten aan boord, schipper drinkt niet.
`)
}

seedVaarTocht().catch((e) => {
  console.error('❌ Seeder fout:', e)
  process.exit(1)
})
