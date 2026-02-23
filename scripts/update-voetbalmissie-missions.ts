/**
 * Update VoetbalMissie checkpoint missies (tekst only — GPS-coördinaten blijven intact)
 *
 * Gebruik:
 *   bun scripts/update-voetbalmissie-missions.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const missions = [
  {
    orderIndex: 0,
    name: 'Checkpoint 1 — De Spotter',
    missionTitle: '🕵️ Scoutingrapport: Is Dit Voetballand?',
    missionDescription:
      'Jullie zijn talent-scouts voor een Eredivisie-club. Zoek het meest CREATIEVE ding in de buurt dat als goal kan dienen — een hek, prullenbak, bankje, maakt niet uit. Heel team erbij en IEDEREEN doet een overdreven goal-viering! Schrijf op: geef deze plek een cijfer van 1-10 als voetballocatie. En wie had de meest dramatische viering?',
    missionType: 'foto',
    hint1: 'Denk groot — een goal hoeft geen echte goal te zijn. Kijk naar alles met twee palen of een opening.',
    hint2: 'De viering telt mee voor punten — ga all-in! Denk aan Ronaldo, Mbappe of Dansen.',
    hint3: 'Geen inspiratie? Zet iemand naast de "goal" als keeper en fotografeer de schutter.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 1,
    name: 'Checkpoint 2 — De Straatinterviewer',
    missionTitle: '🎤 Voetbalwijsheid van de Straat',
    missionDescription:
      'Zoek iemand die je NIET kent — hoe ouder hoe beter. Stel deze vraag: "Als u morgen voor één dag een profvoetballer bent, wie bent u dan en waarom?" Schrijf het antwoord op. Hoe gekker het antwoord, hoe beter! Bonus: vraag of ze hun goal-viering mogen voordoen en maak een foto. Extra bonus als ze het ook echt doen!',
    missionType: 'opdracht',
    hint1: 'Begin met: "Mag ik u iets vragen voor een voetbalmissie?" — werkt bijna altijd!',
    hint2: 'Als iemand nee zegt: geen probleem, gewoon de volgende proberen. Elke team spreekt minstens 1 persoon aan.',
    hint3: 'Hoe serieuzer jij de vraag stelt, hoe leuker het antwoord. Doe alsof het een echte reportage is!',
    bonusPhotoPoints: 50,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 2,
    name: 'Checkpoint 3 — De Pylonen',
    missionTitle: '⚡ Menselijke Pylonen — Beat the Record',
    missionDescription:
      'Jullie maken zelf een slalom! 3 teamleden staan als pylonen: benen wijd, armen omhoog. De anderen sprint zigzag ER DOORHEEN zonder iemand aan te tikken. Maar de pylonen mogen bewegen! Jullie hebben 45 seconden — tel hoe vaak jullie de hele slalom compleet door zijn gegaan. Schrijf het record op + de naam van jullie snelste pyloon en jullie snelste loper.',
    missionType: 'opdracht',
    hint1: 'Zet de pylonen op minstens 2 meter afstand van elkaar, anders is het te makkelijk.',
    hint2: 'Pylonen mogen hun benen bewegen maar niet hun voeten verplaatsen — maakt het lastiger!',
    hint3: 'Tellen en aanmoedigen telt ook mee — iedereen heeft een rol.',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
  {
    orderIndex: 3,
    name: 'Checkpoint 4 — De Community Champions',
    missionTitle: '🦸 Community Champions: 8 Minuten Held',
    missionDescription:
      'Dit is geen oefening — jullie helpen echt iemand in de buurt! De spelleider heeft een klus geregeld. Jullie hebben 8 minuten. Verdeel het werk slim: iedereen doet iets. Na de klus: foto met de persoon die jullie hielpen. Iedereen duim omhoog. Schrijf ook op: wat was de klus en wie was jullie MVP (meest waardevolle helper)?',
    missionType: 'foto',
    hint1: 'Vraag bij aankomst: "Wij zijn de Community Champions, wat mogen wij voor u doen?" Werkt gegarandeerd.',
    hint2: 'Verdeel de rollen: één aanvoerder die de leiding neemt, de rest volgt direct.',
    hint3: 'Foto niet vergeten — de persoon die geholpen is MOET op de foto!',
    bonusPhotoPoints: 0,
    timeLimitSeconds: 480,
  },
  {
    orderIndex: 4,
    name: 'Checkpoint 5 — De Kampioensceremonie',
    missionTitle: '🏆 Jullie Eigen Goal Celebration — Voor Altijd',
    missionDescription:
      'Missie geslaagd! Jullie trainer heeft teruggevonden wat hij kwijt was. Nu mag het feest beginnen. Jullie team verdient een eigen goal celebration — één die jullie de rest van het seizoen gebruiken als jullie scoren. Bedenk hem samen: 3 bewegingen + een teamroep. Oefen hem 3 keer tot hij perfect zit. Beschrijf hem in het antwoord: beweging 1, beweging 2, beweging 3, teamroep. Op welke echte viering lijkt hij het meest?',
    missionType: 'opdracht',
    hint1: 'Denk aan de beste goal celebrations die jullie kennen — Ronaldo "SIIII", Dansen, De Robot. Mixen mag!',
    hint2: 'De teamroep moet iedereen tegelijk zeggen — oefen het zodat het klinkt als één stem.',
    hint3: 'Beweging 1 = opstarten, beweging 2 = het mooiste moment, beweging 3 = de eindpose. Dan de roep!',
    bonusPhotoPoints: 0,
    timeLimitSeconds: null,
  },
]

async function updateMissions() {
  console.log('\n⚽ VoetbalMissie checkpoint missies updaten...\n')

  // Zoek de tour op naam
  const [tour] = await sql`
    SELECT id FROM tours
    WHERE name LIKE 'VoetbalMissie%'
    ORDER BY created_at DESC
    LIMIT 1
  `

  if (!tour) {
    console.error('❌ Geen VoetbalMissie tour gevonden. Seed eerst: bun scripts/seed-voetbalmissie.ts\n')
    process.exit(1)
  }

  console.log(`  Tour gevonden: ${tour.id}\n`)

  for (const m of missions) {
    const result = await sql`
      UPDATE checkpoints SET
        name                = ${m.name},
        mission_title       = ${m.missionTitle},
        mission_description = ${m.missionDescription},
        mission_type        = ${m.missionType},
        hint1               = ${m.hint1},
        hint2               = ${m.hint2},
        hint3               = ${m.hint3},
        bonus_photo_points  = ${m.bonusPhotoPoints},
        time_limit_seconds  = ${m.timeLimitSeconds}
      WHERE tour_id = ${tour.id}
        AND order_index = ${m.orderIndex}
      RETURNING id
    `

    if (result.length > 0) {
      console.log(`  ✓ CP${m.orderIndex + 1}: ${m.name}`)
    } else {
      console.warn(`  ⚠ CP${m.orderIndex + 1}: niet gevonden (order_index ${m.orderIndex})`)
    }
  }

  console.log('\n✅ Missies bijgewerkt! GPS-coördinaten zijn ongewijzigd.\n')
}

updateMissions().catch((e) => {
  console.error('❌ Update fout:', e)
  process.exit(1)
})
