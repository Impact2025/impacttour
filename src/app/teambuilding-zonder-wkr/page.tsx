import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, CheckCircle2, FileCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Teambuilding zonder WKR — vrijgesteld via gerichte vrijstelling',
  description:
    'Een GPS-teambuildingprogramma dat is ontworpen om te kwalificeren als gerichte vrijstelling — buiten de WKR-vrije ruimte, met leerdoelen en professionele begeleiding.',
  alternates: { canonical: '/teambuilding-zonder-wkr' },
  openGraph: {
    title: 'Teambuilding zonder WKR',
    description: 'Een teambuildingprogramma ontworpen om buiten de WKR-vrije ruimte te vallen.',
    url: '/teambuilding-zonder-wkr',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Valt teambuilding altijd buiten de WKR?',
      acceptedAnswer: { '@type': 'Answer', text: 'Nee. Alleen activiteiten die kwalificeren als gerichte vrijstelling voor scholing of teambuilding (art. 31a Wet LB) vallen buiten de vrije ruimte. Een consumptief bedrijfsuitje valt binnen de vrije ruimte.' },
    },
    {
      '@type': 'Question',
      name: 'Wat is de vrije ruimte in de WKR voor 2026?',
      acceptedAnswer: { '@type': 'Answer', text: '2,00% over de eerste €400.000 van de fiscale loonsom en 1,18% over het meerdere. Overschrijding wordt belast met 80% eindheffing.' },
    },
    {
      '@type': 'Question',
      name: 'Is dit fiscaal advies?',
      acceptedAnswer: { '@type': 'Answer', text: 'Nee, raadpleeg altijd je eigen accountant voor de definitieve fiscale kwalificatie van jouw specifieke situatie.' },
    },
  ],
}

export default function TeambuildingZonderWkrPage() {
  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
            <FileCheck className="w-3 h-3" /> Fiscaal bewust ontworpen
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Teambuilding<br /><span className="text-[#00E676]">zonder je WKR-budget op te souperen</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            In 2026 bedraagt de vrije ruimte 2,00% over de eerste €400.000 loonsom en 1,18% daarboven —
            overschrijding kost 80% eindheffing. Een programma met leerdoelen en professionele begeleiding
            kan als gerichte vrijstelling volledig buiten die vrije ruimte vallen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors">
              Bekijk beschikbare tochten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/kennisbank/wkr-teambuilding-2026" className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-7 py-3.5 rounded-2xl hover:bg-white/5 transition-colors">
              Lees de volledige WKR-gids
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Het onderscheid</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Bedrijfsuitje versus teambuilding, fiscaal bekeken
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Bedrijfsuitje</p>
              <h3 className="font-bold text-[#0F172A] text-sm mb-3">Valt binnen de vrije ruimte</h3>
              <p className="text-[#64748B] text-xs leading-relaxed">
                Vermaak en beloning, zonder aantoonbaar leerdoel. Drukt op je jaarlijkse WKR-budget van
                2,00% / 1,18%.
              </p>
            </div>
            <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-[#DCFCE7]">
              <p className="text-[10px] font-bold text-[#00A84A] uppercase tracking-widest mb-2">IctusGo GPS-teamuitje</p>
              <h3 className="font-bold text-[#0F172A] text-sm mb-3">Ontworpen als gerichte vrijstelling</h3>
              <p className="text-[#64748B] text-xs leading-relaxed">
                Elk checkpoint heeft een leerdoel — samenwerking, communicatie, probleemoplossend vermogen —
                met begeleiding via de AI-coach en een meetbaar resultaat.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Waar de fiscus op let</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-8"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Vier criteria die de kwalificatie bepalen
          </h2>
          <div className="space-y-4">
            {[
              'Objectief verband met de functie — geen subjectief gevoel van nut',
              'Opleidingskarakter met persoonlijke begeleiding en toezicht',
              'Geen hobby of algemene vorming — het draait om beroepsmatige vaardigheden',
              'Fun-elementen zijn ondergeschikt aan het leerdoel, niet omgekeerd',
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                <span className="text-sm text-[#475569]">{f}</span>
              </div>
            ))}
          </div>
          <p className="text-[#94A3B8] text-xs mt-6 leading-relaxed">
            Dit is geen fiscaal advies — raadpleeg altijd je eigen accountant voor de definitieve
            kwalificatie van jouw specifieke situatie. De volledige toelichting met wetsartikelen en
            jurisprudentie staat in onze{' '}
            <Link href="/kennisbank/wkr-teambuilding-2026" className="text-[#00A84A] font-medium hover:underline">
              WKR-gids voor 2026
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
            Vraag de factuur aan die je administratie wil zien
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
            <Link href="/maatschappelijk-teamuitje" className="hover:text-white transition-colors">Maatschappelijk teamuitje</Link>
            <Link href="/kennisbank" className="hover:text-white transition-colors">Kennisbank</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
