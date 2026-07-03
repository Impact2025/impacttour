import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, CheckCircle2, Navigation, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GPS-teamuitje — de complete gids + direct boeken',
  description:
    'Alles over een GPS-teamuitje: hoe het werkt, wat het kost, en waarom meetbare impact het verschil maakt met een gewone speurtocht. Direct te boeken via IctusGo.',
  alternates: { canonical: '/gps-teamuitje' },
  openGraph: {
    title: 'GPS-teamuitje — de complete gids',
    description: 'Hoe een GPS-teamuitje werkt, wat het kost en waarom meetbare impact het verschil maakt.',
    url: '/gps-teamuitje',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wat is een GPS-teamuitje precies?',
      acceptedAnswer: { '@type': 'Answer', text: 'Een GPS-teamuitje is een buitenactiviteit waarbij teams via hun telefoon GPS-checkpoints ontgrendelen en daar opdrachten voltooien. Bij IctusGo worden die opdrachten gescoord op vier dimensies via de Geluksmomenten Score.' },
    },
    {
      '@type': 'Question',
      name: 'Wat kost een GPS-teamuitje?',
      acceptedAnswer: { '@type': 'Answer', text: 'De prijs verschilt per variant en groepsgrootte — van tarieven per groep tot per deelnemer bij schoolvarianten. Vraag een offerte op basis van jullie aantal deelnemers.' },
    },
    {
      '@type': 'Question',
      name: 'Wat is het verschil met een gewone speurtocht?',
      acceptedAnswer: { '@type': 'Answer', text: 'Een gewone speurtocht is vermaak zonder leerdoel. Een IctusGo GPS-teamuitje is ontworpen rond specifieke sociale en reflectieve opdrachten, met een meetbare score per dimensie en een impactrapport na afloop.' },
    },
  ],
}

export default function GpsTeamuitjePage() {
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
            <Navigation className="w-3 h-3" /> GPS-teamuitje
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Het GPS-teamuitje:<br /><span className="text-[#00E676]">meer dan een speurtocht</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            De meeste aanbieders van GPS-speurtochten verkopen een prijs per team, niet een uitkomst. Wij
            verkopen een meetbare score: verbinding, betekenis, plezier en groei — vastgelegd in een
            impactrapport na afloop.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors">
              Bekijk beschikbare tochten <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Uitleg ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Hoe het werkt</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Van GPS-signaal tot impactrapport
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { nr: '01', t: 'Open de link', d: 'Geen app-installatie. Deelnemers openen de tocht direct op hun eigen telefoon.' },
              { nr: '02', t: 'Loop naar het checkpoint', d: 'GPS berekent real-time de afstand. Binnen 50 meter ontgrendelt de opdracht.' },
              { nr: '03', t: 'Voltooi de missie', d: 'Foto, quiz, opdracht of video — met AI-coach Scout voor hints en feedback.' },
              { nr: '04', t: 'Bekijk de score', d: 'Elke opdracht scoort op verbinding, betekenis, plezier en groei — de Geluksmomenten Score.' },
            ].map(({ nr, t, d }) => (
              <div key={nr} className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
                <span className="text-[#00A84A] font-black text-sm" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>{nr}</span>
                <h3 className="font-bold text-[#0F172A] text-sm mt-2 mb-1.5">{t}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waarom niet de goedkoopste ── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Eerlijk verhaal</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-6"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Wij zijn niet de goedkoopste aanbieder — en dat is bewust
          </h2>
          <p className="text-[#64748B] text-sm leading-relaxed mb-4">
            Er zijn GPS-speurtochten te vinden voor een paar tientjes per team. Dat is prima voor een
            vrijblijvend uitje. Wij richten ons op iets anders: een teamdag die na afloop een aanwijsbaar
            resultaat oplevert, niet alleen een groepsfoto.
          </p>
          <p className="text-[#64748B] text-sm leading-relaxed mb-6">
            Elk checkpoint is ontworpen rond een specifieke sociale of reflectieve opdracht. De AI-coach
            geeft geen generieke feedback maar een concrete toelichting per GMS-dimensie. En na afloop
            krijgt elk team een PDF-impactrapport dat direct bruikbaar is in een debriefing — of, voor
            grotere organisaties, als datapunt in CSRD-rapportage.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#00A84A] font-medium">
            <Sparkles className="w-4 h-4" />
            <Link href="/kennisbank/checklist-geslaagde-teambuildingdag" className="hover:underline">
              Bekijk de checklist voor een geslaagde teambuildingdag
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F0FDF4] border-y border-[#DCFCE7] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'WijkTocht voor volwassen teams (60-120 min)',
            'ImpactSprint voor teams zonder tijd (60-90 min, compacte zone)',
            'FamilieTocht voor gezinsdagen (vanaf 6 jaar)',
            'JeugdTocht en VoetbalMissie — AVG-compliant voor kinderen',
          ].map((f) => (
            <div key={f} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
              <span className="text-sm text-[#166534] font-medium">{f}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#00E676] px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Boek jullie GPS-teamuitje
          </h2>
          <Link href="/tochten" className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors">
            Bekijk alle tochten <ArrowRight className="w-4 h-4" />
          </Link>
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
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
