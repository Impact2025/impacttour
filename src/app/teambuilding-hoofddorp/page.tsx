import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, CheckCircle2, MapPin, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Teambuilding Hoofddorp — GPS-teamuitje met sociale impact',
  description:
    'GPS-teambuilding in Hoofddorp voor teams van Kite Pharma, Microsoft, Danone en andere organisaties in de regio. Boek een tocht met meetbare impact via de Geluksmomenten Score.',
  alternates: { canonical: '/teambuilding-hoofddorp' },
  openGraph: {
    title: 'Teambuilding Hoofddorp — GPS-teamuitje met sociale impact',
    description: 'GPS-teambuilding voor teams in Hoofddorp — verbinding, betekenis, plezier en groei, meetbaar via de Geluksmomenten Score.',
    url: '/teambuilding-hoofddorp',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Teambuilding',
  areaServed: { '@type': 'City', name: 'Hoofddorp' },
  provider: { '@type': 'Organization', name: 'IctusGo', url: 'https://ictusgo.nl' },
  name: 'GPS-teambuilding Hoofddorp',
  description: 'GPS-gestuurde outdoor teambuilding met sociale impact voor bedrijven in Hoofddorp.',
}

const SECTORS = [
  { name: 'Life sciences & pharma', examples: 'Kite Pharma, IDEXX, Bioventus' },
  { name: 'Tech & fintech', examples: 'Microsoft, Accruent, Ingenico, Irdeto' },
  { name: 'FMCG & voeding', examples: 'Danone, L\'Oréal, Barentz' },
  { name: 'Logistiek & engineering', examples: 'TNT/FedEx, Fluor, World Courier' },
]

export default function TeambuildingHoofddorpPage() {
  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/"><Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" /></Link>
          <Link href="/tochten" className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors">
            Bekijk tochten
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            <MapPin className="w-3 h-3" /> Hoofddorp &amp; omgeving
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Teambuilding in Hoofddorp<br /><span className="text-[#00E676]">met echte sociale impact</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            Hoofddorp is het hart van internationale hoofdkantoren in life sciences, tech en logistiek —
            en van een arbeidsmarkt met meer vacatures dan werklozen. Een GPS-teamuitje dat verbinding en
            betekenis meetbaar maakt, is hier geen luxe maar een retentiestrategie.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors">
              Bekijk beschikbare tochten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-7 py-3.5 rounded-2xl hover:bg-white/5 transition-colors">
              Vraag een offerte op maat
            </Link>
          </div>
        </div>
      </section>

      {/* ── Waarom Hoofddorp anders is ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">De regio</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-8 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Hoofddorp trekt wereldspelers aan — en dus ook hun concurrentie om talent
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTORS.map(({ name, examples }) => (
              <div key={name} className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] text-sm mb-1">{name}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">{examples}</p>
              </div>
            ))}
          </div>
          <p className="text-[#64748B] text-sm mt-8 max-w-2xl leading-relaxed">
            Met circa 101 vacatures per 100 werklozen is de arbeidsmarkt in deze regio historisch krap.
            Retentie draait hier niet om salaris, maar om cultuurmatch — lees meer in ons artikel over{' '}
            <Link href="/blog/talentretentie-hoofddorp-schiphol" className="text-[#00A84A] font-medium hover:underline">
              talentretentie in de Schiphol-regio
            </Link>.
          </p>
        </div>
      </section>

      {/* ── Hoe het werkt ── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Hoe het werkt</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Een GPS-tocht door en rond Hoofddorp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'GPS-checkpoints verspreid door de buurt of het bedrijventerrein',
              'AI-coach Scout begeleidt elk team en geeft gerichte hints',
              'Elke opdracht scoort op de Geluksmomenten Score: verbinding, betekenis, plezier, groei',
              'Live spelleider-dashboard met realtime voortgang van alle teams',
              'PDF-impactrapport na afloop, direct bruikbaar voor debriefing of CSRD-rapportage',
              'Setup binnen 5 minuten — boeken, betalen, klaar',
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                <span className="text-sm text-[#475569]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-14">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-0.5 mb-4">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />)}
          </div>
          <p className="text-white text-lg md:text-xl font-medium leading-relaxed mb-5">
            &ldquo;We kennen elkaar al jaren maar deze tocht liet zien dat we nog véél van elkaar te leren hebben.
            De gesprekken tijdens de opdrachten waren goud waard.&rdquo;
          </p>
          <p className="text-[#94A3B8] text-sm">Marieke V. — Team Operations, regio Amsterdam</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#00E676] px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Klaar voor een teamdag die blijft hangen?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors">
              Bekijk tochten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/gps-teamuitje" className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors">
              Meer over GPS-teamuitjes
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-4 text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex"><Image src="/images/IctusGo.png" alt="IctusGo" width={80} height={24} className="h-5 w-auto" /></div>
            <span>— onderdeel van TeambuildingMetImpact.nl</span>
          </div>
          <div className="flex gap-4">
            <Link href="/teambuilding-haarlemmermeer" className="hover:text-white transition-colors">Teambuilding Haarlemmermeer</Link>
            <Link href="/tochten" className="hover:text-white transition-colors">Alle tochten</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
