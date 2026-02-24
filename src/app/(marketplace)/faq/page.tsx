import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Veelgestelde vragen — IctusGo',
  description: 'Antwoorden op de meest gestelde vragen over boeken, spelen, technologie en kids-veiligheid.',
}

const CATEGORIES = [
  {
    id: 'boeken',
    title: 'Boeken & Betalen',
    emoji: '💳',
    questions: [
      {
        q: 'Wat kost een IctusGo tocht?',
        a: 'De prijs verschilt per variant. WijkTocht en ImpactSprint zijn geprijsd per groep. VoetbalMissie en JeugdTocht hanteren een tarief per kind (vanaf €6/kind). Bekijk de actuele prijzen op de <a href="/tochten" class="text-[#00E676] hover:underline">tochten-pagina</a>.',
      },
      {
        q: 'Kan ik een boeking annuleren?',
        a: 'Ja. Annulering meer dan 14 dagen voor de datum geeft 100% restitutie. Tussen 7 en 14 dagen: 50%. Minder dan 7 dagen: geen restitutie. Zie onze <a href="/voorwaarden" class="text-[#00E676] hover:underline">algemene voorwaarden</a> voor details.',
      },
      {
        q: 'Welke betaalmethoden worden geaccepteerd?',
        a: 'We accepteren iDEAL, creditcard (Visa/Mastercard), Bancontact en meer — via MultiSafepay. Facturatie op rekening is mogelijk voor scholen en grote organisaties op aanvraag.',
      },
      {
        q: 'Kan ik een couponcode gebruiken?',
        a: 'Ja! Voer je couponcode in stap 2 van het boekingsformulier in. De korting wordt direct berekend. Heb je een code ontvangen van een partner of school? Dat werkt hetzelfde.',
      },
      {
        q: 'Ontvang ik een bevestiging na betaling?',
        a: 'Ja, je ontvangt direct een e-mail met een magische toegangslink naar je klantportaal. Via die link kun je teams aanmaken, een naam kiezen voor de sessie en de joincode met deelnemers delen.',
      },
    ],
  },
  {
    id: 'spelen',
    title: 'Spelen & Navigeren',
    emoji: '🗺️',
    questions: [
      {
        q: 'Hoe werkt het GPS-systeem?',
        a: 'Deelnemers openen de game-link op hun telefoon. De app berekent real-time de afstand tot het volgende checkpoint via de Haversine-formule. Binnen 50 meter van een checkpoint ontgrendelt de opdracht automatisch.',
      },
      {
        q: 'Hoeveel checkpoints heeft een tocht?',
        a: 'De standaard varianten (WijkTocht, FamilieTocht, JeugdTocht, VoetbalMissie) hebben 5 checkpoints. ImpactSprint heeft er ook 5, maar in een compactere zone (500m radius). Maatwerk is mogelijk.',
      },
      {
        q: 'Hoe werkt de AI-assistent?',
        a: 'Scout (voor volwassenen) en Buddy (familie) zijn open AI-assistenten waarmee teams kunnen chatten en hints opvragen. Flits (kids-variant) werkt alleen via voorgedefinieerde hint-knoppen — geen vrij typen.',
      },
      {
        q: 'Wat als het internet wegvalt tijdens de tocht?',
        a: 'De app heeft een offline-modus. Kaarten zijn gecached, GPS blijft werken. Antwoorden worden lokaal opgeslagen en automatisch gesynchroniseerd zodra de verbinding terugkomt.',
      },
      {
        q: 'Hoe lang duurt een gemiddelde tocht?',
        a: 'De meeste varianten duren 60 tot 120 minuten, afhankelijk van het aantal checkpoints en het tempo van de groep. VoetbalMissie is ontworpen voor 90 minuten inclusief debriefing.',
      },
    ],
  },
  {
    id: 'technologie',
    title: 'Technologie & App',
    emoji: '📱',
    questions: [
      {
        q: 'Moet ik een app installeren?',
        a: 'Nee. IctusGo werkt als een Progressive Web App (PWA) — gewoon via de browser. Optioneel kan je de app toevoegen aan je startscherm voor een volledigere ervaring, maar dat is niet verplicht.',
      },
      {
        q: 'Welke browsers worden ondersteund?',
        a: 'Chrome (Android en iOS), Safari (iOS), Firefox en Edge. We raden Chrome op Android aan voor de beste GPS-prestaties. Internet Explorer wordt niet ondersteund.',
      },
      {
        q: 'Werkt de app op alle telefoons?',
        a: 'Elke moderne smartphone met GPS en een recente browser volstaat. GPS-nauwkeurigheid verschilt per apparaat — oudere telefoons of GPS-blokkers kunnen de radius-berekening beïnvloeden.',
      },
      {
        q: 'Hoe kunnen deelnemers meedoen?',
        a: 'De spelleider deelt een unieke joincode of directe link. Deelnemers bezoeken de link, voeren de code in en kiezen hun teamnaam. Geen account of installatie nodig.',
      },
    ],
  },
  {
    id: 'kids',
    title: 'Kids & Veiligheid',
    emoji: '🛡️',
    questions: [
      {
        q: 'Is IctusGo AVG-compliant voor kinderen?',
        a: 'Ja. Voor JeugdTocht (9-13 jaar) en VoetbalMissie (9-12 jaar) slaan we géén persoonsgegevens van kinderen op. Alleen een anoniem teamtoken en teamnaam. Geen oudertoestemming voor data nodig.',
      },
      {
        q: 'Hoe werkt geofencing?',
        a: 'De spelleider tekent een veilige zone in op de kaart. De app controleert via een ray casting algoritme of elk team binnen de zone blijft. Bij overschrijding gaat direct een alarm op de spelleider-app via een privé Pusher kanaal.',
      },
      {
        q: "Worden foto's van kinderen bewaard?",
        a: "Foto's die kinderen uploaden als onderdeel van een opdracht worden automatisch verwijderd na 30 dagen. Dit gebeurt via een dagelijkse geautomatiseerde opschoontaak. Foto's worden nooit gedeeld met derden.",
      },
      {
        q: 'Wat is de minimumleeftijd?',
        a: 'JeugdTocht is ontworpen voor 9 tot 13 jaar. VoetbalMissie voor 9 tot 12 jaar. FamilieTocht is geschikt voor gezinnen met kinderen vanaf 6 jaar (met begeleiding van een volwassene). WijkTocht en ImpactSprint zijn voor volwassenen en tieners van 16+.',
      },
      {
        q: 'Kan de spelleider de groepen live volgen?',
        a: 'Ja. Via het beheerportaal ziet de spelleider real-time welke teams actief zijn, hoeveel checkpoints ze hebben voltooid en of iemand buiten de geofence is gegaan. GPS-locaties van teams worden niet opgeslagen.',
      },
    ],
  },
]

export default function FaqPage() {
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
      <section className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 md:px-8 py-10 md:py-14">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Hulp nodig?</p>
          <h1
            className="text-3xl md:text-5xl font-black text-[#0F172A] mb-3"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Veelgestelde vragen
          </h1>
          <p className="text-[#64748B] text-sm leading-relaxed">
            Kun je het antwoord niet vinden? Stuur een mail naar{' '}
            <a href="mailto:info@teambuildingmetimpact.nl" className="text-[#00E676] hover:underline">
              info@teambuildingmetimpact.nl
            </a>
          </p>

          {/* Categorie anchors */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {CATEGORIES.map(({ id, emoji, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-[#E2E8F0] text-[#475569] px-3 py-1.5 rounded-full hover:border-[#00E676]/40 hover:text-[#0F172A] transition-colors"
              >
                {emoji} {title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Content ────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-14">
          {CATEGORIES.map(({ id, title, emoji, questions }) => (
            <div key={id} id={id}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{emoji}</span>
                <h2
                  className="text-2xl font-black text-[#0F172A]"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {title}
                </h2>
              </div>

              <div className="space-y-3">
                {questions.map(({ q, a }) => (
                  <div
                    key={q}
                    className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden"
                  >
                    <div className="flex items-start gap-3 p-5">
                      <ChevronRight className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#0F172A] text-sm mb-2">{q}</p>
                        <p
                          className="text-[#64748B] text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: a }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="bg-[#0F172A] rounded-3xl p-8 text-center">
            <p
              className="text-xl font-black text-white mb-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Nog een vraag?
            </p>
            <p className="text-[#94A3B8] text-sm mb-5">
              Ons team helpt je graag verder — binnen één werkdag.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:info@teambuildingmetimpact.nl"
                className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-6 py-3 rounded-2xl hover:bg-[#00C853] transition-colors"
              >
                Stuur een e-mail
              </a>
              <Link
                href="/tochten"
                className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-6 py-3 rounded-2xl hover:bg-white/5 transition-colors"
              >
                Bekijk alle tochten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-4 text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex">
              <Image src="/images/IctusGo.png" alt="IctusGo" width={80} height={24} className="h-5 w-auto" />
            </div>
            <span>— onderdeel van TeambuildingMetImpact.nl</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link>
            <Link href="/voorwaarden" className="hover:text-white transition-colors">Voorwaarden</Link>
            <Link href="/faq" className="text-white font-semibold">FAQ</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
