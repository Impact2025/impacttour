import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, CheckCircle2, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Maatschappelijk teamuitje — impact die telt in je CSRD-verslag',
  description:
    'Een maatschappelijk teamuitje dat teamontwikkeling combineert met échte sociale impact — direct te koppelen aan CSRD (ESRS S1/S3) en SROI-verplichtingen.',
  alternates: { canonical: '/maatschappelijk-teamuitje' },
  openGraph: {
    title: 'Maatschappelijk teamuitje — impact die telt',
    description: 'Teamontwikkeling combineren met sociale impact, meetbaar en CSRD-klaar.',
    url: '/maatschappelijk-teamuitje',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Maatschappelijke teambuilding',
  provider: { '@type': 'Organization', name: 'IctusGo', url: 'https://ictusgo.nl' },
  name: 'Maatschappelijk teamuitje',
  description: 'GPS-teambuilding met concrete maatschappelijke opdrachten, meetbaar via de Geluksmomenten Score en koppelbaar aan CSRD-rapportage.',
}

export default function MaatschappelijkTeamuitjePage() {
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
            <Heart className="w-3 h-3" /> Maatschappelijk teamuitje
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Een teamuitje dat<br /><span className="text-[#00E676]">iets teruggeeft</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            Geen symbolisch tintje, maar concrete maatschappelijke opdrachten tijdens een GPS-tocht —
            meetbaar via de Geluksmomenten Score, en direct koppelbaar aan medewerkersbetrokkenheid (ESRS
            S1) en lokale impact (ESRS S3) in je duurzaamheidsverslag.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors">
              Bekijk beschikbare tochten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/organisaties" className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-7 py-3.5 rounded-2xl hover:bg-white/5 transition-colors">
              Word locatiepartner
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Drievoudige opbrengst</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Eén investering, drie aantoonbare resultaten
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { t: 'Teamontwikkeling', d: 'Verbinding, betekenis, plezier en groei — gescoord op de Geluksmomenten Score, per checkpoint.' },
              { t: 'CSRD-datapunten', d: 'Direct bruikbaar onder ESRS S1 (medewerkersbetrokkenheid) en ESRS S3 (lokale gemeenschappen).' },
              { t: 'SROI-waarde', d: 'Bestede uren aan maatschappelijke opdrachten kunnen meetellen bij aanbestedingsverplichtingen.' },
            ].map(({ t, d }) => (
              <div key={t} className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] text-sm mb-2">{t}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <p className="text-[#64748B] text-sm mt-8 max-w-2xl leading-relaxed">
            Lees de volledige uitwerking in{' '}
            <Link href="/kennisbank/csrd-teambuilding-esrs-s1" className="text-[#00A84A] font-medium hover:underline">
              CSRD en de ESRS S1-rapportage van teambuilding
            </Link>{' '}
            of{' '}
            <Link href="/blog/maatschappelijk-teamuitje-organiseren" className="text-[#00A84A] font-medium hover:underline">
              waarom een maatschappelijk teamuitje fiscaal slimmer is
            </Link>.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Hoe het eruitziet</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Geen symbolisch tintje, wel concrete opdrachten
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Gesprek met een buurtbewoner over wat de wijk nodig heeft',
              'Kleine klus voor een lokale sociale onderneming of stichting',
              'Co-creatie met een wijkinitiatief, gekoppeld aan een concrete opgave',
              'Reflectiemoment over de impact van jullie eigen team op de omgeving',
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                <span className="text-sm text-[#475569]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#00E676] px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Klaar om impact te maken die je kunt rapporteren?
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
            <Link href="/teambuilding-zonder-wkr" className="hover:text-white transition-colors">Teambuilding zonder WKR</Link>
            <Link href="/gps-teamuitje" className="hover:text-white transition-colors">GPS-teamuitje</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
