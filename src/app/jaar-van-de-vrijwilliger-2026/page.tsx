import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, Star, Heart, Users, Sparkles, CalendarDays } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Jaar van de Vrijwilliger 2026 | Meer waarderen dan ooit',
  description:
    '2026 is het Internationaal Jaar van de Vrijwilliger, met aandacht van Koningin Máxima. Pak de kans om vrijwilligers écht te waarderen — met erkenning én meetbare impact.',
  alternates: { canonical: '/jaar-van-de-vrijwilliger-2026' },
  openGraph: {
    title: 'Jaar van de Vrijwilliger 2026 | Meer waarderen dan ooit',
    description:
      'Het officiële jaar van de vrijwilliger, met Máxima-aandacht. Zo maak je erkenning concreet en meetbaar.',
    url: '/jaar-van-de-vrijwilliger-2026',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Jaar van de Vrijwilliger 2026',
  description:
    '2026 is het Internationaal Jaar van de Vrijwilliger. Een unieke kans om vrijwilligers structureel te waarderen met erkenning en meetbare impact.',
  author: { '@type': 'Person', name: 'Vincent van Munster' },
  publisher: { '@type': 'Organization', name: 'IctusGo' },
}

export default function JaarVanDeVrijwilligerPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/images/IctusGo.png"
              alt="IctusGo"
              width={120}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/contact?subject=vrijwilligers-dankdag"
            className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors"
          >
            Vraag een voorstel
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            <Star className="w-3 h-3" /> 2026
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Het Jaar van de<br />
            <span className="text-[#00E676]">Vrijwilliger 2026</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            2026 is uitgeroepen tot het Internationaal Jaar van de Vrijwilliger — met
            landelijke aandacht en betrokkenheid van Koningin Máxima. Eén kans om vrijwilligers
            niet alleen te bedanken, maar écht te waarderen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/impact-vrijwilligers-dankdag"
              className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors"
            >
              De Vrijwilligers Dankdag <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vrijwilligers-teambuilding"
              className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-7 py-3.5 rounded-2xl hover:bg-white/5 transition-colors"
            >
              Vrijwilligersteambuilding
            </Link>
          </div>
        </div>
      </section>

      {/* ── DE KANS ──────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            De kans
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Eén jaar waarin erkenning landelijk leeft
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Star,
                t: 'Landelijke aandacht',
                d: 'Een heel jaar lang staat vrijwilligerswerk in de schijnwerpers — méér begrip bij bestuur en gemeenteraad.',
              },
              {
                icon: Heart,
                t: 'Máxima-effect',
                d: 'Met betrokkenheid van Koningin Máxima krijgt waardering een gezicht. Organisaties die nu inzetten, profiteren mee.',
              },
              {
                icon: Users,
                t: 'Jongere vrijwilligers',
                d: 'Het jaar richt zich expliciet op nieuwe, jongere vrijwilligers — een kans om je bestand te vernieuwen.',
              },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <div className="w-9 h-9 rounded-xl bg-[#00E676]/10 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-[#00A84A]" />
                </div>
                <h3 className="font-bold text-[#0F172A] text-sm mb-2">{t}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 MANIEREN ───────────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Concreet
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            5 manieren om vrijwilligers écht te waarderen in 2026
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Maak erkenning zichtbaar — niet alleen een woord, maar een programma',
              'Meet wat vrijwilligers opleveren, voor mens én organisatie',
              'Verbind vrijwilligers onderling — verbinding houdt ze vast',
              'Zet impact in voor subsidie- en fondsenwerving',
              'Betrek jongere vrijwilligers met een fris, actief format',
              'Sluit het jaar af met een moment dat blijft hangen',
            ].map((f, i) => (
              <div key={f} className="flex items-start gap-3">
                <span className="text-sm font-black text-[#00C853] mt-0.5 w-5 shrink-0">
                  {i + 1}.
                </span>
                <span className="text-sm text-[#475569]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRUG NAAR PRODUCT ────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20 border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#00A84A] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-3 uppercase tracking-widest">
              <CalendarDays className="w-3 h-3" /> Het antwoord
            </span>
            <h2
              className="text-2xl md:text-4xl font-black text-[#0F172A] mb-3"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              De Impact Vrijwilligers Dankdag
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed mb-5">
              Precies wat 2026 vraagt: een betekenisvolle ervaring die vrijwilligers laat voelen
              hoe waardevol ze zijn — en de organisatie concrete impactdata oplevert voor
              subsidieaanvragen. Plan hem in het Jaar van de Vrijwilliger.
            </p>
            <Link
              href="/impact-vrijwilligers-dankdag"
              className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors"
            >
              Ontdek de Dankdag <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="md:w-72 shrink-0 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-6">
            <Sparkles className="w-6 h-6 text-[#16a34a] mb-3" />
            <p className="text-sm text-[#475569] leading-relaxed">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              "Een jaar lang aandacht voor vrijwilligers is mooi. Wij maken er een ervaring van
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              die ze niet vergeten — en waarvan je de impact kunt aantonen."
            </p>
            <p className="text-xs font-bold text-[#0F172A] mt-3">Vincent van Munster</p>
            <p className="text-xs text-[#64748B]">Oprichter IctusGo & WeAreImpact</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-4 text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex">
              <Image
                src="/images/IctusGo.png"
                alt="IctusGo"
                width={80}
                height={24}
                className="h-5 w-auto"
              />
            </div>
            <span>— onderdeel van TeambuildingMetImpact.nl</span>
          </div>
          <div className="flex gap-4">
            <Link href="/impact-vrijwilligers-dankdag" className="hover:text-white transition-colors">
              Vrijwilligers Dankdag
            </Link>
            <Link href="/vrijwilligers-uitje" className="hover:text-white transition-colors">
              Vrijwilligersuitje
            </Link>
            <Link href="/tochten" className="hover:text-white transition-colors">
              Tochten
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
