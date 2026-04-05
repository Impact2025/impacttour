/**
 * Seed script: De Bosdetectives — FamilieTocht Haarlemmermeerse Bos
 *
 * Start: Restaurant Vork en Mes, Haarlemmermeerse Bos
 * Route: ~1.5 km, 4 checkpoints, 60-90 minuten
 * Geschikt voor: gezinnen met kids van 8-12 jaar
 *
 * ⚠️  GPS-coördinaten zijn schattingen — verifieer en pas aan
 *     via: Admin → Tour bewerken → Kaarteditor
 *
 * Uitvoeren:
 *   bunx tsx scripts/seed-bosdetectives.ts [email]
 *
 * Optioneel: geef je eigen e-mailadres mee als argument om als
 * eigenaar van de tour te worden ingesteld.
 * Voorbeeld: bunx tsx scripts/seed-bosdetectives.ts jij@example.com
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  const ownerEmail = process.argv[2] ?? 'spelleider@impacttocht.nl'
  console.log(`\n🌳 Seeding: De Bosdetectives — FamilieTocht\n`)
  console.log(`   Eigenaar: ${ownerEmail}\n`)

  // ─── Spelleider / eigenaar ─────────────────────────────────────────────────
  const [spelleider] = await sql`
    INSERT INTO users (name, email, role, email_verified)
    VALUES ('Spelleider Bosdetectives', ${ownerEmail}, 'spelleider', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  console.log(`✓ Spelleider: ${ownerEmail} (id: ${spelleider.id})`)

  // ─── Tour aanmaken ─────────────────────────────────────────────────────────
  const storyFrame = {
    introText: `🌳 Welkom, Bosdetectives! Jullie missie: ontdek de geheimen van het Haarlemmermeerse Bos. Er zijn aanwijzingen verstopt op 4 plekken. Gebruik jullie ogen, oren en fantasie — want alleen als HEEL het gezin samenwerkt, komen jullie er!`,
    finaleReveal: `🏆 Missie geslaagd, Bosdetectives! Jullie hebben het bos van kop tot teen verkend, samengewerkt als een echt team en de natuur door nieuwe ogen gezien. Tijd om te vieren bij Vork en Mes — jullie hebben het verdiend!`,
  }

  const [tour] = await sql`
    INSERT INTO tours (
      name, description, variant, created_by_id,
      is_published, estimated_duration_min, max_teams, price_in_cents,
      story_frame
    ) VALUES (
      'De Bosdetectives — Haarlemmermeerse Bos',
      'Een avontuurlijke familietocht door het Haarlemmermeerse Bos. Start bij restaurant Vork en Mes en ontdek samen vier geheime plekken vol opdrachten voor het hele gezin. Dieren spotten, bomen meten, kunst maken — allemaal in het bos!',
      'familietocht',
      ${spelleider.id},
      true,
      90,
      4,
      0,
      ${JSON.stringify(storyFrame)}
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  if (!tour) {
    console.log('! Tour "De Bosdetectives" bestaat al. Verwijder hem eerst als je opnieuw wilt seeden.')
    process.exit(0)
  }

  console.log(`✓ Tour: De Bosdetectives (id: ${tour.id})`)

  // ─── Checkpoints ──────────────────────────────────────────────────────────
  // GPS-coördinaten zijn schattingen op basis van kaartanalyse.
  // Haarlemmermeerse Bos ligt ten zuiden van Hoofddorp.
  // Restaurant Vork en Mes: ~52.2985, 4.6820
  // ⚠️  Verifieer ALLE coördinaten via de kaarteditor voor gebruik!
  const checkpoints = [
    {
      order: 0,
      name: 'De Grote Vijver',
      description: 'De grote vijver in het Haarlemmermeerse Bos — thuisbasis van eenden, ganzen en allerlei waterdiertjes',
      type: 'kennismaking',
      lat: 52.3005, lng: 4.6798,   // ~300m noordwest van Vork en Mes — VERIFICEER!
      missionTitle: 'De Telwedstrijd',
      missionDesc: `🦆 Kijk samen goed rond bij de vijver! Jullie gaan dieren tellen. Maar let op — sommige zijn zeldzamer dan andere:\n\n🦆 Eend = 1 punt\n🪿 Gans = 2 punten\n🐸 Kikker = 5 punten\n🐦 Iets wat je nog nooit hebt gezien = 10 punten!\n\nGeef samen een score op en schrijf op: wat was jullie vreemdste of grappigste vondst? Maak een foto van het meest bijzondere dier (of de plek waar je het zag).`,
      missionType: 'foto',
      connection: 15, meaning: 10, joy: 25, growth: 10,
      hint1: 'Loop vanaf Vork en Mes het pad in richting het water — je hoort de eenden al!',
      hint2: 'De grote vijver heeft een houten steiger of een oever met riet — zoek die kant op',
      hint3: 'Kijk goed in het water én op de oever — kikkers zitten vaak verstopt tussen de stenen',
    },
    {
      order: 1,
      name: 'Het Speelbos',
      description: 'Het avontuurlijke speelbos met klimobstakels en bomen om te verkennen',
      type: 'samenwerking',
      lat: 52.3025, lng: 4.6775,   // ~600m van start — VERIFICEER!
      missionTitle: 'Boomhoogte Raadspel',
      missionDesc: `🌲 Kies samen de HOOGSTE boom die jullie kunnen vinden.\n\nNu gaan jullie hem meten zonder meetlint! Truc: ga zover van de boom af dat je je duim voor je uitgestrekte arm net over de top kunt houden. Die afstand is (bijna) gelijk aan de hoogte van de boom. Tel je stappen terug naar de boom (1 stap ≈ 70cm).\n\n📐 Iedereen schat EERST hoeveel meter de boom is, DAN meten jullie samen. Wie zat het dichtst bij?\n\n🌍 Sociale impact: schrijf op één papiertje: "Als alle bomen hier weg waren, zouden wij thuis één ding veranderen: ..." Lees ze voor aan elkaar.`,
      missionType: 'opdracht',
      connection: 15, meaning: 20, joy: 20, growth: 15,
      hint1: 'Zoek het gebied met grote bomen en avontuurlijke speelelementen',
      hint2: 'Het speelbos heeft houten klimobstakels en paden door de bomen',
      hint3: 'Kijk omhoog — de hoogste boom staat meestal wat vrijstaand zodat je hem goed kunt zien',
    },
    {
      order: 2,
      name: 'De Geheime Open Plek',
      description: 'Een rustige open plek of heuvel midden in het bos — de perfecte plek voor boskunst',
      type: 'reflectie',
      lat: 52.3040, lng: 4.6800,   // ~900m van start — VERIFICEER!
      missionTitle: 'Familieschildpad',
      missionDesc: `🎨 Jullie gaan een mini-kunstwerk maken van dingen die jullie op de grond vinden.\n\nStap 1: Leg ALLE handen plat op de grond — voel de aarde!\nStap 2: Zoek samen: 1 steen, 1 veertje, 1 iets-wat-je-normaal-nooit-opmerkt\nStap 3: Maak er een kunstwerk van op de grond — een gezicht, een dier, een patroon — jullie kiezen!\nStap 4: Maak een groepsfoto met het kunstwerk én het hele gezin erin\n\n💬 Daarna vertelt iedereen: "Mijn gevonden ding lijkt op mij omdat..."`,
      missionType: 'foto',
      connection: 25, meaning: 15, joy: 20, growth: 10,
      hint1: 'Zoek een open plek of een kleine verhoging in het bos waar je ruimte hebt',
      hint2: 'Een open plek met gras of zand is perfect — zoek naar een plek zonder te veel struiken',
      hint3: 'Soms is een bankje of picknickplek ook een goede open plek — kijk of er één in de buurt is',
    },
    {
      order: 3,
      name: 'Finish — Restaurant Vork en Mes',
      description: 'Terug bij het startpunt! Tijd voor de finale opdracht en een welverdiende beloning',
      type: 'feest',
      lat: 52.2985, lng: 4.6820,   // Restaurant Vork en Mes — VERIFICEER!
      missionTitle: 'Het Bosrapport',
      missionDesc: `🏆 Jullie zijn er bijna! Maar eerst... de FINALE MISSIE.\n\nBedenk samen in exact 2 minuten:\n\n✨ Het MOOISTE wat we vandaag zagen: ...\n😬 Het LELIJKSTE of meest trieste wat we zagen: ...\n⭐ Ons CIJFER voor het bos (1-10): ...\n💡 Onze TIP voor de bosbeheerder: ...\n\nSchrijf alles op en neem het mee naar binnen. Geef het Bosrapport aan de ober of leg het op tafel — jullie hebben de geheimen van het Haarlemmermeerse Bos ontdekt!\n\n🌳 Maak ter afsluiting een groepsfoto voor de ingang van Vork en Mes.`,
      missionType: 'foto',
      connection: 20, meaning: 25, joy: 20, growth: 10,
      hint1: 'Loop terug naar Vork en Mes — volg hetzelfde pad of ga via een andere route terug',
      hint2: 'Vork en Mes is het restaurant waar jullie zijn begonnen — volg de bordjes',
      hint3: 'Loop richting het parkeerterrein en de ingang van het park — Vork en Mes is vlakbij',
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
        ${cp.lat}, ${cp.lng}, 60,
        ${cp.missionTitle}, ${cp.missionDesc}, ${cp.missionType},
        ${cp.connection}, ${cp.meaning}, ${cp.joy}, ${cp.growth},
        ${cp.hint1}, ${cp.hint2}, ${cp.hint3}, true
      )
    `
    console.log(`  ✓ Checkpoint ${cp.order + 1}: ${cp.name} [${cp.lat}, ${cp.lng}]`)
  }

  // ─── Game sessie ───────────────────────────────────────────────────────────
  const [session] = await sql`
    INSERT INTO game_sessions (tour_id, spelleider_id, status, join_code, variant)
    VALUES (${tour.id}, ${spelleider.id}, 'lobby', 'BOSDET', 'familietocht')
    ON CONFLICT (join_code) DO UPDATE SET status = 'lobby'
    RETURNING id
  `
  console.log(`\n✓ Sessie aangemaakt (joincode: BOSDET, id: ${session.id})`)

  // ─── Team voor het gezin ───────────────────────────────────────────────────
  await sql`
    INSERT INTO teams (game_session_id, name, team_token, total_gms_score)
    VALUES (${session.id}, 'Familie Bosdetectives', 'token-bosdet-familie-01', 0)
    ON CONFLICT (team_token) DO NOTHING
  `
  console.log(`  ✓ Team: Familie Bosdetectives`)

  // ─── Samenvatting ─────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ De Bosdetectives — FamilieTocht seed compleet!

📍 Tour: De Bosdetectives — Haarlemmermeerse Bos
   Joincode:  BOSDET
   Variant:   FamilieTocht (Buddy assistent)
   Duur:      ~90 minuten
   Route:     Vork en Mes → Grote Vijver → Speelbos
              → Geheime Open Plek → Finish Vork en Mes
   Afstand:   ~1.5 km looproute

📋 Checkpoints:
   1. De Grote Vijver     — Dieren spotten + tellen
   2. Het Speelbos        — Boomhoogte meten + natuur impact
   3. De Geheime Open Plek — Boskunst + familiegesprek
   4. Vork en Mes (finish) — Bosrapport schrijven + groepsfoto

⚠️  GPS-VERIFICATIE VEREIST:
   Coördinaten zijn schattingen — pas aan via kaarteditor:
   Admin → Tours → De Bosdetectives → Bewerken → Kaarteditor
   unlock_radius is 60m (iets ruimer voor kids)

📱 Starten:
   1. Log in als spelleider: ${ownerEmail}
   2. Ga naar: /admin/sessies → sessie BOSDET
   3. Of direct: /klant/${session.id}/beheer
   4. START de sessie op het park
   5. Gezin joint via joincode BOSDET op /join

🎮 Buddy (AI assistent) is actief voor FamilieTocht.
   Kids mode is NIET actief (geen geofencing, wél chat).
   Voor volledige kids safety: gebruik JeugdTocht variant.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
