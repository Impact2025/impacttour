import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL!)

const CP1 = 'ca566968-c351-45fa-aa0c-78d0638f5a3d'
const CP2 = '227618a1-98c4-46c9-a45b-71da9d48ba96'
const CP3 = '896a5490-2368-4868-bf57-7c09563b6ce7'

async function run() {
  // ── CP1: Bunnik Got Talent ──────────────────────────────────────────────────
  await sql`
    UPDATE checkpoints SET
      mission_title       = '🎤 Bunnik Got Talent — Live Optreden Verplicht',
      mission_description = ${'Jullie zijn nu een beroemde boyband/girlgroup. Jullie naam bedenk je zelf. Jullie taak: zoek een willekeurige voorbijganger (of winkelier) en voer een act op van precies 30 seconden. Alles mag: zingen, dansen, rap, toneelstukje, goocheltruc — maar het moet spectaculair zijn.\n\nDe voorbijganger geeft een score van 1-10. Schrijf op:\n• Naam van jullie band\n• Wat jullie hebben opgevoerd\n• De score die jullie kregen\n• De reactie van de persoon (woordelijk, hoe gekker hoe beter)\n\nScore 6 of lager telt NIET — dan moet je het bij iemand anders opnieuw proberen. Dus vol gas!'},
      hint1               = 'Bang om te beginnen? Zeg gewoon: "Goedemiddag, wij zijn [bandnaam] en wij hebben één optreden voor u." Dan is er geen weg meer terug.',
      hint2               = 'Geen inspiratie? Zing het Spongebob-thema maar dan over Bunnik. "Wie woont er in een dorp vol stenen..." — vrijwel gegarandeerd succes.',
      hint3               = 'Maak het groter: choreografie, iedereen zingt tegelijk, één persoon doet de wanhopige danseres — hoe meer chaos, hoe hoger de score.'
    WHERE id = ${CP1}
  `
  console.log('✓ CP1: Bunnik Got Talent')

  // ── CP2: Het Nutteloze Interview ────────────────────────────────────────────
  await sql`
    UPDATE checkpoints SET
      mission_title       = '🎙️ Het Meest Nutteloze Interview ter Wereld',
      mission_description = ${'Jullie zijn reporters voor nieuwsshow "Bunnik Vandaag". Zoek iemand voor een interview (hoe ouder hoe beter). Stel deze 4 vragen zo bloedserieus mogelijk:\n\n1. "Als Bunnik een superkracht had — welke was dat?"\n2. "Welk dier past het best bij dit dorp en waarom?"\n3. "Als u morgen burgemeester bent, wat verbiedt u als eerste?"\n4. Verzin zelf de meest absurde vraag die je kunt bedenken\n\nSchrijf ALLE antwoorden op. Wie de meest waanzinnige antwoorden geeft wint de "Bunnik Burger van het Jaar" prijs — die mag je zelf uitreiken (ook een prijs die je verzint).'},
      hint1               = 'Openingszin die bijna altijd werkt: "Goedemiddag, wij zijn reporters van Bunnik Vandaag. Heeft u 2 minuten?" Dan direct vraag 1.',
      hint2               = 'Hoe serieuzer jij de vragen stelt, hoe gekker de antwoorden worden. Knik instemmend bij elk antwoord alsof het héél normaal is.',
      hint3               = 'Als iemand nee zegt: "Geen probleem!" en direct naar de volgende. Dat duurt nooit lang — de meeste mensen doen graag mee als je het grappig brengt.'
    WHERE id = ${CP2}
  `
  console.log('✓ CP2: Het Nutteloze Interview')

  // ── CP3: Olympische Bunnikspelen ────────────────────────────────────────────
  await sql`
    UPDATE checkpoints SET
      mission_title       = '🏅 De Olympische Bunnikspelen — Jullie Verzinnen de Regels',
      mission_description = ${'Welkom bij de allereerste Olympische Bunnikspelen! Jullie verzinnen ter plekke 3 compleet nieuwe sporten met alleen wat jullie om je heen vinden — blaadjes, stenen, tassen, schoenen, alles mag.\n\nIedere sport heeft:\n• Een naam\n• Precies 1 simpele regel\n• Een winnaar\n\nSpeel elke sport 45 seconden. Schrijf op:\n• Sportnaam + regel (alle 3)\n• Wie won welke sport\n• Welke sport het grappigste was en waarom\n\nBonus: maak een foto van het meest belachelijke moment van de hele spelen.'},
      hint1               = 'Vastgelopen? Kijk in je zakken: sleutel, snoepje, pet, telefoon — elk voorwerp is een wedstrijd waard. "Wie gooit dit het verst" is een geldige sport.',
      hint2               = '"Wie loopt het langzaamst zonder te stoppen" of "wie kan het langst op één been terwijl de anderen afleiden" — simpel = vaak het grappigst.',
      hint3               = 'Sport 3 mag ook een stil kampioenschap zijn: "wie kan het langst een serieus gezicht houden terwijl de anderen grappige gezichten trekken."',
      bonus_photo_points  = 30
    WHERE id = ${CP3}
  `
  console.log('✓ CP3: Olympische Bunnikspelen')

  console.log('\n🎉 Klaar! Duke gaat dit geweldig vinden.')
}

run().catch(e => { console.error('❌', e); process.exit(1) })
