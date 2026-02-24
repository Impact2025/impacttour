import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Privacybeleid — IctusGo',
  description: 'Lees hoe IctusGo omgaat met persoonsgegevens en AVG-compliance.',
}

const SECTIONS = [
  {
    nr: '1',
    title: 'Wie is verantwoordelijk?',
    content: [
      'De verwerkingsverantwoordelijke is: WeAreImpact (handelend onder de naam TeambuildingMetImpact / IctusGo), gevestigd te Nieuw-Vennep, Nederland.',
      'Contactgegevens voor privacy-zaken: info@teambuildingmetimpact.nl',
    ],
  },
  {
    nr: '2',
    title: 'Welke gegevens verwerken wij?',
    content: [
      '**Klantgegevens (boekende partij):** naam, e-mailadres, telefoonnummer, organisatienaam. Deze zijn noodzakelijk voor de uitvoering van de overeenkomst.',
      '**Spelersgegevens (deelnemers volwassenen):** teamnaam, teamtoken (anonieme identifier). Geen naam, e-mail of andere PII van individuele deelnemers.',
      '**Spelersgegevens (kinderen, JeugdTocht / VoetbalMissie):** uitsluitend teamnaam en teamtoken. Geen enkele vorm van persoonsgegevens van kinderen.',
      '**Foto\'s:** door teams geüploade afbeeldingen als onderdeel van opdrachten. Voor kindsvarianten worden foto\'s automatisch verwijderd na 30 dagen.',
      '**Technische gegevens:** IP-adres, browsertype, sessie-cookies (voor authenticatie en beveiliging).',
      '**Betalingsgegevens:** worden volledig verwerkt door MultiSafepay. IctusGo slaat geen betaalkaartgegevens op.',
    ],
  },
  {
    nr: '3',
    title: 'Verwerkingsdoeleinden en grondslagen',
    content: [
      '**Uitvoering overeenkomst (art. 6 lid 1b AVG):** e-mailadres en naam voor het sturen van toegangslinks, facturen en spelleider-communicatie.',
      '**Gerechtvaardigd belang (art. 6 lid 1f AVG):** technische logdata voor platformbeveiliging en foutopsporing.',
      '**Wettelijke verplichting (art. 6 lid 1c AVG):** bewaartermijnen voor facturen en financiële administratie (7 jaar).',
      'IctusGo verwerkt géén persoonsgegevens voor profilering, geautomatiseerde besluitvorming of direct marketing zonder toestemming.',
    ],
  },
  {
    nr: '4',
    title: 'Dataretentie — bewaartermijnen',
    content: [
      '**Klantgegevens:** bewaard zolang de klantrelatie actief is + 2 jaar daarna voor klantenservice.',
      '**Factuurgegevens:** 7 jaar (wettelijke bewaarplicht).',
      '**Teamtokens en teamnamen:** worden verwijderd 6 maanden na afloop van de sessie.',
      '**Foto\'s (volwassenen-varianten):** bewaard tot 90 dagen na de sessie, daarna automatisch verwijderd.',
      '**Foto\'s (kindsvarianten — JeugdTocht / VoetbalMissie):** automatisch verwijderd na 30 dagen via dagelijkse cron job.',
      '**Sessie-logs / webhooks:** 90 dagen voor debugdoeleinden.',
    ],
  },
  {
    nr: '5',
    title: 'Kids-veiligheid — Privacy by Design',
    content: [
      'Voor JeugdTocht (9-13 jaar) en VoetbalMissie (9-12 jaar) passen wij extra strenge privacy-maatregelen toe:',
      '🔒 **Geen PII opgeslagen:** geen naam, geboortedatum, e-mail of andere persoonlijke gegevens van kinderen.',
      '📍 **Geofencing:** deelnemers worden bewaakt binnen een ingestelde zone. Bij grensoverschrijding gaat een alarm naar de spelleider. Locatiedata wordt niet bewaard.',
      '💬 **Geen open chat:** kinderen kunnen niet vrij typen. Alleen voorgedefinieerde hint-knoppen zijn beschikbaar (Flits-assistent).',
      '🗑️ **Foto-cleanup:** geüploade foto\'s worden automatisch verwijderd na 30 dagen.',
      '🛡️ **Teamtoken-systeem:** kinderen spelen via een anonieme teamtoken — geen account, geen inloggegevens.',
    ],
  },
  {
    nr: '6',
    title: 'Uw rechten onder de AVG',
    content: [
      'U heeft de volgende rechten met betrekking tot uw persoonsgegevens:',
      '**Inzage:** u kunt opvragen welke gegevens wij van u verwerken.',
      '**Rectificatie:** u kunt onjuiste gegevens laten corrigeren.',
      '**Verwijdering ("recht op vergetelheid"):** u kunt verzoeken uw gegevens te verwijderen, tenzij een wettelijke bewaarplicht geldt.',
      '**Beperking:** u kunt de verwerking van uw gegevens laten beperken.',
      '**Bezwaar:** u kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.',
      '**Gegevensoverdraagbaarheid:** u kunt uw gegevens in een machineleesbaar formaat opvragen.',
      'Verzoeken kunt u indienen via info@teambuildingmetimpact.nl. Wij reageren binnen 30 dagen.',
    ],
  },
  {
    nr: '7',
    title: 'Cookies en tracking',
    content: [
      'IctusGo gebruikt uitsluitend functionele cookies (sessie-authenticatie). Geen tracking- of marketingcookies.',
      'De kaartfunctionaliteit maakt gebruik van OpenStreetMap tiles — een open source kaartservice. Zie het privacybeleid van OpenStreetMap Foundation.',
      'Kaartdata (GPS-coördinaten) wordt niet opgeslagen op onze servers — alleen gebruikt voor real-time afstandsberekening in de browser.',
    ],
  },
  {
    nr: '8',
    title: 'Derde partijen en sub-verwerkers',
    content: [
      '**Neon (database):** EU-hosted PostgreSQL. Verwerkersovereenkomst aanwezig.',
      '**Vercel (hosting):** edge-functies gehost in EU. Verwerkersovereenkomst aanwezig.',
      '**Resend (e-mail):** transactionele e-mails. Verwerkersovereenkomst aanwezig.',
      '**MultiSafepay (betalingen):** PCI DSS-gecertificeerde betalingsverwerker. Verwerkt betalingsgegevens — IctusGo heeft geen inzage in betaalkaartdata.',
      '**Pusher (realtime):** voor live scorebord en geofence-alerts. Geen persoonsgegevens worden doorgestuurd.',
      '**OpenRouter / Anthropic (AI):** AI-evaluaties worden verwerkt door het model. Antwoorden van deelnemers worden niet bewaard door OpenRouter na verwerking.',
    ],
  },
  {
    nr: '9',
    title: 'Beveiliging',
    content: [
      'Alle communicatie verloopt via HTTPS/TLS. Wachtwoorden worden gehasht opgeslagen (bcrypt).',
      'Toegang tot de spelleider-omgeving is beveiligd via magic links (eenmalige tokens). Teamtokens geven alleen toegang tot de eigen teamsessie.',
      'Wij voeren periodieke beveiligingsreviews uit en houden onze afhankelijkheden up-to-date.',
    ],
  },
  {
    nr: '10',
    title: 'Klachten',
    content: [
      'Heeft u een klacht over de verwerking van uw persoonsgegevens? Neem eerst contact op via info@teambuildingmetimpact.nl.',
      'U heeft ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens: autoriteitpersoonsgegevens.nl',
    ],
  },
  {
    nr: '11',
    title: 'Wijzigingen',
    content: [
      'Dit privacybeleid kan periodiek worden bijgewerkt. De meest actuele versie is altijd beschikbaar via ictusgo.nl/privacy.',
      'Bij ingrijpende wijzigingen informeren wij actieve klanten per e-mail.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hidden md:block text-[#64748B] hover:text-[#0F172A] transition-colors">Home</Link>
            <Link href="/tochten" className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors">
              Boek een Tocht
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest mb-3">Juridisch</p>
          <h1
            className="text-3xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Privacybeleid
          </h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            Versie 1.0 — Geldig vanaf 1 januari 2025. IctusGo neemt privacy serieus, in het bijzonder voor minderjarige deelnemers. Dit beleid beschrijft hoe wij omgaan met persoonsgegevens in lijn met de AVG.
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Kids highlight */}
          <div className="bg-[#DCFCE7] rounded-2xl p-5 border border-[#00E676]/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-bold text-[#0F172A] text-sm mb-1">Extra bescherming voor kinderen</p>
                <p className="text-[#0F172A]/70 text-xs leading-relaxed">
                  Voor JeugdTocht en VoetbalMissie slaan wij géén persoonsgegevens van kinderen op.
                  Geen naam, geen e-mail — alleen een anoniem teamtoken. Foto&apos;s worden na 30 dagen automatisch verwijderd.
                </p>
              </div>
            </div>
          </div>

          {SECTIONS.map(({ nr, title, content }) => (
            <div key={nr} className="border-b border-[#E2E8F0] pb-10 last:border-0 last:pb-0">
              <div className="flex items-start gap-4 mb-4">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-xs font-black text-[#00E676]">
                  {nr}
                </span>
                <h2
                  className="text-xl font-black text-[#0F172A] pt-0.5"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {title}
                </h2>
              </div>
              <ul className="space-y-2 pl-12">
                {content.map((line, i) => (
                  <li
                    key={i}
                    className="text-sm text-[#475569] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0]">
            <h3 className="font-bold text-[#0F172A] text-sm mb-2">Vragen over privacy?</h3>
            <p className="text-[#64748B] text-sm">
              Neem contact op via{' '}
              <a href="mailto:info@teambuildingmetimpact.nl" className="text-[#00E676] hover:underline">
                info@teambuildingmetimpact.nl
              </a>
              {' '}of lees onze{' '}
              <Link href="/voorwaarden" className="text-[#00E676] hover:underline">algemene voorwaarden</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-4 text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex">
              <Image src="/images/IctusGo.png" alt="IctusGo" width={80} height={24} className="h-5 w-auto" />
            </div>
            <span>— onderdeel van TeambuildingMetImpact.nl</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/privacy" className="text-white font-semibold">Privacybeleid</Link>
            <Link href="/voorwaarden" className="hover:text-white transition-colors">Voorwaarden</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
