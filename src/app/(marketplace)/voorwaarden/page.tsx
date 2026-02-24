import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Algemene Voorwaarden — IctusGo',
  description: 'Lees onze algemene voorwaarden voor het gebruik van het IctusGo platform.',
}

const SECTIONS = [
  {
    nr: '1',
    title: 'Definities',
    content: [
      'In deze algemene voorwaarden wordt verstaan onder:',
      '**IctusGo / TeambuildingMetImpact**: de handelsnaam waaronder Stichting WeAreImpact haar diensten aanbiedt, gevestigd te Nieuw-Vennep, Nederland.',
      '**Klant**: de natuurlijke persoon of rechtspersoon die een overeenkomst aangaat met IctusGo voor het afnemen van een Tocht.',
      '**Tocht**: een GPS-gestuurd outdoor ervaringsprogramma (inclusief varianten zoals WijkTocht, ImpactSprint, FamilieTocht, JeugdTocht en VoetbalMissie).',
      '**Deelnemer**: elke persoon die feitelijk deelneemt aan een Tocht.',
      '**Platform**: de webapplicatie en bijbehorende API\'s die IctusGo aanbiedt via ictusgo.nl.',
    ],
  },
  {
    nr: '2',
    title: 'Toepasselijkheid',
    content: [
      'Deze algemene voorwaarden zijn van toepassing op alle offertes, overeenkomsten en leveringen van diensten door IctusGo.',
      'Afwijkingen van deze voorwaarden zijn slechts geldig indien uitdrukkelijk schriftelijk overeengekomen.',
      'De toepasselijkheid van inkoop- of andere voorwaarden van de klant wordt uitdrukkelijk van de hand gewezen.',
    ],
  },
  {
    nr: '3',
    title: 'Totstandkoming overeenkomst',
    content: [
      'Een overeenkomst komt tot stand op het moment dat de klant de boeking heeft bevestigd via het platform én de betaling is verwerkt.',
      'IctusGo stuurt na succesvolle betaling een bevestigingsmail met een toegangslink naar het klantportaal.',
      'Voor gratis (coupon-)boekingen wordt de overeenkomst direct na invullen van het boekingsformulier gesloten.',
    ],
  },
  {
    nr: '4',
    title: 'Dienstverlening',
    content: [
      'IctusGo biedt GPS-gestuurd outdoor teambuilding aan via haar platform. De klant ontvangt na boeking toegang tot een beheeromgeving waarmee de Tocht gestart en gevolgd kan worden.',
      'De Tocht bestaat uit digitale opdrachten, GPS-checkpoints en optionele AI-begeleiding. Inhoud kan per variant verschillen.',
      'IctusGo streeft naar een beschikbaarheid van het platform van minimaal 99% buiten geplande onderhoudsmomenten.',
      'IctusGo is gerechtigd het platform periodiek te updaten of tijdelijk buiten gebruik te stellen voor onderhoud, met minimale impact op geboekte Tochen.',
    ],
  },
  {
    nr: '5',
    title: 'Betaling',
    content: [
      'Betalingen worden verwerkt via MultiSafepay. Alle bedragen zijn inclusief btw, tenzij anders vermeld.',
      'Betaling dient te geschieden vóór aanvang van de Tocht. Bij niet-tijdige betaling kan IctusGo de toegang weigeren.',
      'Facturen worden digitaal verzonden en dienen binnen 14 dagen te worden voldaan, tenzij schriftelijk anders afgesproken.',
      'Bij betalingsverzuim is de klant van rechtswege in verzuim en is de wettelijke handelsrente verschuldigd.',
    ],
  },
  {
    nr: '6',
    title: 'Annulering en restitutie',
    content: [
      'Annulering meer dan 14 dagen voor de geboekte datum: 100% restitutie.',
      'Annulering 7-14 dagen voor de geboekte datum: 50% restitutie.',
      'Annulering minder dan 7 dagen voor de geboekte datum: geen restitutie, tenzij IctusGo uitdrukkelijk anders besluit.',
      'Bij annulering door IctusGo (bv. technische onmogelijkheid) ontvangt de klant volledige restitutie of een alternatieve datum.',
      'Geen-shows zonder voorafgaande annulering geven geen recht op restitutie.',
    ],
  },
  {
    nr: '7',
    title: 'Verplichtingen deelnemer',
    content: [
      'Deelnemers dienen de instructies van de spelleider te volgen en zich te houden aan de aangewezen speelzone.',
      'Deelname is op eigen risico. IctusGo is niet aansprakelijk voor schade als gevolg van het niet-opvolgen van veiligheidsinstructies.',
      'Deelnemers dienen zich sportief en respectvol te gedragen jegens andere deelnemers, omwonenden en de omgeving.',
      'Bij overlast of ongepast gedrag kan de spelleider de deelnemer van verdere deelname uitsluiten zonder restitutie.',
    ],
  },
  {
    nr: '8',
    title: 'Aansprakelijkheid',
    content: [
      'IctusGo is niet aansprakelijk voor schade voortvloeiend uit het gebruik van het platform, tenzij er sprake is van opzet of grove nalatigheid.',
      'IctusGo is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst.',
      'De aansprakelijkheid van IctusGo is in alle gevallen beperkt tot het bedrag dat de klant voor de betreffende Tocht heeft betaald.',
      'IctusGo is niet verantwoordelijk voor handelen of nalaten van deelnemers of derden.',
    ],
  },
  {
    nr: '9',
    title: 'Intellectueel eigendom',
    content: [
      'Alle rechten van intellectueel eigendom op het platform, de opdrachten, het AI-systeem en de bijbehorende documentatie berusten bij IctusGo.',
      'Het is niet toegestaan om zonder voorafgaande schriftelijke toestemming van IctusGo de inhoud van het platform te kopiëren, te verspreiden of commercieel te exploiteren.',
    ],
  },
  {
    nr: '10',
    title: 'Privacy',
    content: [
      'IctusGo verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG). Zie ons <a href="/privacy" class="text-[#00E676] hover:underline">privacybeleid</a> voor details.',
      'Voor JeugdTocht en VoetbalMissie (9-13 jaar) worden geen persoonsgegevens van kinderen opgeslagen. Alleen teamnaam en teamtoken worden gebruikt. Foto\'s worden automatisch verwijderd na 30 dagen.',
    ],
  },
  {
    nr: '11',
    title: 'Toepasselijk recht en geschillen',
    content: [
      'Op deze voorwaarden is Nederlands recht van toepassing.',
      'Geschillen zullen in eerste instantie worden beslecht via minnelijk overleg. Indien partijen er niet uitkomen, is de bevoegde rechter in het arrondissement Noord-Holland (locatie Haarlem) exclusief bevoegd.',
    ],
  },
  {
    nr: '12',
    title: 'Wijzigingen',
    content: [
      'IctusGo behoudt zich het recht voor deze voorwaarden te wijzigen. Gewijzigde voorwaarden zijn van toepassing op overeenkomsten die na de wijzigingsdatum worden gesloten.',
      'De meest actuele versie van deze voorwaarden is altijd beschikbaar op ictusgo.nl/voorwaarden.',
    ],
  },
]

export default function VoorwaardenPage() {
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
            Algemene Voorwaarden
          </h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            Versie 1.0 — Geldig vanaf 1 januari 2025. Van toepassing op alle diensten van IctusGo / TeambuildingMetImpact, onderdeel van WeAreImpact (Nieuw-Vennep, Nederland).
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-10">
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
            <h3 className="font-bold text-[#0F172A] text-sm mb-2">Vragen over deze voorwaarden?</h3>
            <p className="text-[#64748B] text-sm">
              Neem contact op via{' '}
              <a href="mailto:info@teambuildingmetimpact.nl" className="text-[#00E676] hover:underline">
                info@teambuildingmetimpact.nl
              </a>{' '}
              of bekijk ons{' '}
              <Link href="/privacy" className="text-[#00E676] hover:underline">privacybeleid</Link>.
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link>
            <Link href="/voorwaarden" className="text-white font-semibold">Voorwaarden</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
