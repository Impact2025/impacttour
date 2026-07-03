import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, CheckCircle2, MapPin, Plane } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Teambuilding Haarlemmermeer & Schiphol-Rijk — GPS-teamuitje',
  description:
    'GPS-teambuilding voor bedrijven op Schiphol-Rijk en in Haarlemmermeer. Ontworpen voor internationale teams in aviation, logistiek en tech — meetbaar via de Geluksmomenten Score.',
  alternates: { canonical: '/teambuilding-haarlemmermeer' },
  openGraph: {
    title: 'Teambuilding Haarlemmermeer & Schiphol-Rijk',
    description: 'GPS-teambuilding voor internationale teams op Schiphol-Rijk en in Haarlemmermeer.',
    url: '/teambuilding-haarlemmermeer',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Teambuilding',
  areaServed: { '@type': 'Place', name: 'Haarlemmermeer' },
  provider: { '@type': 'Organization', name: 'IctusGo', url: 'https://ictusgo.nl' },
  name: 'GPS-teambuilding Haarlemmermeer',
  description: 'GPS-gestuurde outdoor teambuilding met sociale impact voor bedrijven op Schiphol-Rijk en in Haarlemmermeer.',
}

export default function TeambuildingHaarlemmermeerPage() {
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

      <section className="bg-[#0F172A] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            <Plane className="w-3 h-3" /> Schiphol-Rijk &amp; Haarlemmermeer
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Teambuilding op Schiphol-Rijk<br /><span className="text-[#00E676]">tussen de vliegtuigbouwers</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            Schiphol-Rijk is gebouwd op het terrein van de voormalige Fokker-fabrieken en herbergt vandaag
            een Center of Excellence voor engineering, logistiek en aerospace. Een GPS-teamuitje dat die
            geschiedenis en dynamiek benut, werkt beter dan een generiek programma in een hotelzaaltje.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors">
              Bekijk beschikbare tochten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/tocht-op-maat" className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-7 py-3.5 rounded-2xl hover:bg-white/5 transition-colors">
              Laat een tocht op maat genereren
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Waarom hier</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-6 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Een multimodale gateway vraagt om een ander soort teamdag
          </h2>
          <p className="text-[#64748B] text-sm leading-relaxed max-w-2xl mb-8">
            Wereldspelers als Schiphol Group, KLM, Microsoft, GKN Aerospace en Fluor werken hier letterlijk
            naast elkaar. Dat brengt internationale, snel groeiende teams samen die vaak weinig gedeelde
            geschiedenis hebben — precies de reden waarom verbinding hier bewust moet worden ontworpen in
            plaats van te ontstaan bij toeval.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { v: '101/100', l: 'vacatures per 100 werklozen in de regio' },
              { v: '90%', l: 'van vliegtuigfabrikanten bediend door GKN Aerospace vanuit Schiphol-Rijk' },
              { v: '4', l: 'generaties die hier tegelijk op de werkvloer samenwerken' },
            ].map(({ v, l }) => (
              <div key={l} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] text-center">
                <p className="text-2xl font-black text-[#0F172A] mb-1" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>{v}</p>
                <p className="text-[#64748B] text-xs leading-relaxed">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Wat je krijgt</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Elke tocht is meetbaar, niet alleen leuk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'GPS-checkpoints op maat van jullie locatie of bedrijventerrein',
              'AI-begeleiding via Scout — vrij chattende coach voor volwassen teams',
              'Score op vier dimensies: verbinding, betekenis, plezier, groei',
              'PDF-impactrapport, herbruikbaar voor debriefing en CSRD-rapportage',
              'Internationale teams? Programma is taalonafhankelijk op te zetten',
              'Van ImpactSprint (60-90 min) tot een volledige WijkTocht (120 min)',
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                <span className="text-sm text-[#475569]">{f}</span>
              </div>
            ))}
          </div>
          <p className="text-[#64748B] text-sm mt-8 max-w-2xl leading-relaxed">
            Meer weten over hoe wij impact meetbaar maken? Lees{' '}
            <Link href="/blog/gps-tocht-sociale-impact-meetbaar-gms" className="text-[#00A84A] font-medium hover:underline">
              hoe de Geluksmomenten Score werkt
            </Link>{' '}
            of bekijk{' '}
            <Link href="/kennisbank/welke-ictusgo-tocht-past-bij-jouw-team" className="text-[#00A84A] font-medium hover:underline">
              welke variant het beste past bij jullie team
            </Link>.
          </p>
        </div>
      </section>

      <section className="bg-[#00E676] px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Plan een GPS-tocht op Schiphol-Rijk of in Haarlemmermeer
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors">
              Bekijk tochten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors">
              Vraag een offerte aan
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
            <Link href="/teambuilding-hoofddorp" className="hover:text-white transition-colors flex items-center gap-1"><MapPin className="w-3 h-3" /> Teambuilding Hoofddorp</Link>
            <Link href="/tochten" className="hover:text-white transition-colors">Alle tochten</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
