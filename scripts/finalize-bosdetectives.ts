/**
 * Finalize script: De Bosdetectives — alle teksten klaar voor gebruik
 * Enthousiaste, gezinsgerichte copy voor tour + checkpoints
 *
 * Uitvoeren:
 *   bunx tsx scripts/finalize-bosdetectives.ts
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const TOUR_ID    = 'e24e90ce-bb62-4601-9e1d-85f5ebb01c55'
const SESSION_ID = '0ae96712-3c13-4c33-9e6f-578b781f4a42'

const CP = {
  vijver:  'f3ac0c69-492d-4d69-af93-cd9b027bb0c2',
  speelbos:'40c607c8-9ad9-4da2-ac17-e5a562c5b55c',
  openPlek:'f095b01d-5947-4bd5-9f8b-a8c7d68184e4',
  finish:  '790d0a39-0958-439f-9a23-055c793bbd64',
}

async function finalize() {
  console.log('\n🚀 Bosdetectives klaar zetten voor gebruik...\n')

  // ─── Tour: naam + beschrijving + story frame ───────────────────────────────
  const storyFrame = {
    introText: `Goeiemorgen, Bosdetectives! 🌳🔍\n\nVandaag worden jullie het ONDERZOEKSTEAM van het Haarlemmermeerse Bos. Er zijn 4 geheime locaties — en alleen jullie kunnen ze vinden.\n\nOp elke plek wacht een opdracht. Soms moet je racen. Soms moet je stilstaan en goed kijken. En soms moet je gewoon samen lachen.\n\nBelangrijkste regel: je kunt het NIET alleen. Je hebt het hele team nodig.\n\nKlaar? Buddy staat voor je klaar met hints als je er niet uitkomt. Succes — en geniet van het bos! 🌲`,
    finaleReveal: `🏆 MISSIE VOLTOOID!\n\nJullie hebben het gedaan! Alle 4 locaties gevonden, alle opdrachten uitgevoerd — als een écht team.\n\nJullie hebben vandaag:\n• Dieren opgespoord die de meeste mensen nooit zien\n• Een boom gemeten zonder meetlint\n• Forensisch bewijs gevonden van geheime bosbewoners\n• Een officieel Bosrapport geschreven\n\nEn nu het allerbeste nieuws: de finish is Vork en Mes. Tijd voor iets lekkers. Jullie hebben het meer dan verdiend. 🍕🥤`,
  }

  await sql`
    UPDATE tours SET
      name        = 'De Bosdetectives — Haarlemmermeerse Bos 🌳',
      description = 'Trek je wandelschoenen aan en word vandaag Bosdetective! Samen verkennen jullie het Haarlemmermeerse Bos op zoek naar 4 geheime locaties vol uitdagingen. Dieren spotten, bomen meten, forensisch sporen zoeken en een officieel Bosrapport schrijven. Geschikt voor het hele gezin — start en finish bij Restaurant Vork en Mes.',
      story_frame = ${JSON.stringify(storyFrame)}
    WHERE id = ${TOUR_ID}
  `
  console.log('✓ Tour — naam, beschrijving en story frame bijgewerkt')

  // ─── CP1: De Grote Vijver ──────────────────────────────────────────────────
  await sql`
    UPDATE checkpoints SET
      description    = 'De grote vijver van het Haarlemmermeerse Bos — vol leven als je goed kijkt. Eenden, ganzen, reigers... en als je heel stil bent misschien nog veel meer.',
      mission_title  = '⚔️ De Telwedstrijd — Iedereen voor zich!',
      mission_description = ${'Oké team, dit is jullie eerste test. Jullie gaan dieren tellen — maar dan WEL eerlijk.\n\n📋 De regels:\n1. Iedereen telt 2 minuten ZELFSTANDIG (geen overleg!)\n2. Loop je eigen rondje langs het water\n3. Niemand mag z\'n score zeggen voordat de tijd om is\n4. Dan tegelijk omdraaien en vergelijken\n\n🦆 Eend = 1 pt\n🪿 Gans = 2 pt\n🐸 Kikker = 5 pt\n🦅 Reiger / roofvogel / waterrat / iets onverwachts = 10 pt!\n\nSchrijf je score op, tel alles op en upload een foto van jullie meest bijzondere vondst. Wie had de scherpste ogen?'},
      hint1 = 'Loop het pad langs het water en kijk niet alleen op het water — ook de oever en het riet zijn vol leven.',
      hint2 = 'Ganzen zitten vaak iets verderop dan de eenden. Loop een rondje om de hele vijver.',
      hint3 = 'Kikkers zijn lastig! Kijk bij stenen en nat gras aan de waterkant — ze zitten vaak verstopt in de schaduw.'
    WHERE id = ${CP.vijver}
  `
  console.log('✓ CP1 (Grote Vijver) — teksten bijgewerkt')

  // ─── CP2: Het Speelbos ────────────────────────────────────────────────────
  await sql`
    UPDATE checkpoints SET
      description    = 'Het avontuurlijke speelbos met reusachtige bomen, klimobstakels en de perfecte plek voor een boomhoogte-experiment.',
      mission_title  = '📐 Boomhoogtemeter — Wie zit er het dichtst bij?',
      mission_description = ${'Jullie gaan een boom meten. Maar er is één addertje: zonder meetlint.\n\n🌲 Stap 1: Kies samen de HOOGSTE boom die jullie kunnen vinden\nStap 2: Iedereen schat de hoogte in meters — schrijf het op vóór je meet!\nStap 3: Gebruik de duimtruc:\n  → Strek je arm uit met je duim omhoog\n  → Loop achteruit tot je duim precies de boom "bedekt" van wortel tot top\n  → Die afstand = (bijna) de hoogte van de boom\n  → Tel je stappen terug naar de boom (1 stap ≈ 70 cm)\n\nStap 4: Bereken de hoogte en vergelijk met jullie schattingen 🏆\n\n💬 Bonusvraag: als deze boom zo\'n 80 jaar oud is... wat was er op deze plek toen jouw opa/oma werd geboren?'},
      hint1 = 'Zoek een vrijstaande boom — een boom die alleen staat kun je beter meten dan eentje midden in een groepje.',
      hint2 = 'Loop ver genoeg achteruit. Grotere bomen vereisen meer afstand — soms 30 meter of meer.',
      hint3 = 'Doe de duimtruc twee keer en neem het gemiddelde. De meeste bomen in dit bos zijn 15-25 meter hoog.'
    WHERE id = ${CP.speelbos}
  `
  console.log('✓ CP2 (Speelbos) — teksten bijgewerkt')

  // ─── CP3: De Geheime Open Plek ────────────────────────────────────────────
  await sql`
    UPDATE checkpoints SET
      description    = 'Een open plek diep in het bos — rustig, mooi en vol verborgen aanwijzingen als je weet waar je moet kijken.',
      mission_title  = '🔍 De Spoorzoeker — Forensisch Bosonderzoek',
      mission_description = ${'Opgelet: jullie zijn nu forensisch onderzoekers. Het bos lijkt leeg — maar dat is schijn.\n\nJullie opdracht: zoek 5 bewijzen dat hier dieren leven.\n\nWat telt als bewijs?\n🐾 Pootafdrukken in modder of zand\n💩 Uitwerpselen (kijk naar de vorm!)\n🌳 Knaagsporen aan bomen of takken\n🪶 Veren of plukjes haar\n🕳️ Holletjes, nestjes of graafsporen\n🍄 Omgevallen takken met sporen van vraat\n\n📸 Fotografeer elk bewijs.\n\n🧪 Rolverdeling:\n→ De OUDSTE is de forensisch expert: legt bij elke foto uit welk dier dit gemaakt heeft en waarom\n→ De JONGSTE is de spotter: wijst de volgende locatie aan\n\nKlaar? Upload de 5 foto\'s en benoem jullie meest opmerkelijke vondst.'},
      hint1 = 'Begin bij de grond — pootafdrukken en knaagsporen zijn het makkelijkst te vinden. Kijk bij modderige plekken.',
      hint2 = 'Kijk omhoog naar de bomen: spechtenholten, knaagsporen en loshangende schors zijn ook bewijs.',
      hint3 = 'Geen sporen gevonden? Zoek dan bij de rand van het bos of bij een plas water — dieren komen daar altijd.'
    WHERE id = ${CP.openPlek}
  `
  console.log('✓ CP3 (Open Plek) — teksten bijgewerkt')

  // ─── CP4: Finish Vork en Mes ──────────────────────────────────────────────
  await sql`
    UPDATE checkpoints SET
      description    = 'De finish! Restaurant Vork en Mes wacht op jullie — maar eerst het allerlaatste onderdeel van de missie.',
      mission_title  = '📋 Het Officiële Bosrapport',
      mission_description = ${'Jullie zijn er bijna! Maar een goede detective sluit altijd de zaak officieel af.\n\nSchrijf samen in exact 3 minuten het Bosrapport:\n\n✨ Het MOOISTE wat we vandaag zagen:\n😬 Het LELIJKSTE of meest verrassende:\n🐾 Onze BESTE forensische vondst:\n⭐ Ons CIJFER voor het Haarlemmermeerse Bos (1-10):\n💡 Eén TIP voor de bosbeheerder:\n\nMaak daarna een groepsfoto voor de ingang van Vork en Mes — officieel bewijs dat jullie de missie hebben voltooid.\n\nEn dan... naar binnen voor een welverdiende beloning. 🍕🥤\n\nJullie zijn officieel gecertificeerde Bosdetectives! 🌳🔍'},
      hint1 = 'Jullie zijn op de goede plek als je Vork en Mes kunt zien — loop naar de ingang.',
      hint2 = 'Heb je de route gevolgd? Dan ben je nu bijna terug bij het startpunt.',
      hint3 = 'Vork en Mes heeft een terras aan het park — perfect voor de groepsfoto!'
    WHERE id = ${CP.finish}
  `
  console.log('✓ CP4 (Finish) — teksten bijgewerkt')

  // ─── Sessie: zet op lobby (klaar om te starten) ───────────────────────────
  await sql`
    UPDATE game_sessions SET status = 'lobby'
    WHERE tour_id = ${TOUR_ID}
  `
  console.log('✓ Sessie — status: lobby (klaar om te starten)')

  // ─── Team naam bijwerken ───────────────────────────────────────────────────
  await sql`
    UPDATE teams SET name = 'Team Bosdetectives'
    WHERE game_session_id = (
      SELECT id FROM game_sessions WHERE tour_id = ${TOUR_ID} LIMIT 1
    )
  `
  console.log('✓ Team — naam: Team Bosdetectives')

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ De Bosdetectives is KLAAR VOOR GEBRUIK!

🎮 Joincode: BOSDET

📍 Op de dag zelf:
   1. Log in als spelleider
   2. Ga naar /admin/sessies → klik BOSDET → START
   3. Gezin opent de app op telefoon → /join → BOSDET
   4. Iedereen ziet de introtekst + Buddy staat klaar

⚠️  Vergeet niet: GPS-coördinaten verifiëren via kaarteditor!
   Admin → Tours → De Bosdetectives → Bewerken

🌳 Veel plezier in het bos!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

finalize().catch((e) => {
  console.error(e)
  process.exit(1)
})
