import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, Heart, MapPin, Sparkles, Gift, PartyPopper } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vrijwilligersuitje met Impact 2026 | Erkenning die blijft hangen',
  description:
    'Op zoek naar een vrijwilligers uitje met impact? Een GPS-tocht vol erkenning, verbinding en meetbare impact — perfect als dankdag of teamuitje voor vrijwilligers.',
  alternates: { canonical: '/vrijwilligers-uitje' },
  openGraph: {
    title: 'Vrijwilligersuitje met Impact 2026 | Erkenning die blijft hangen',
    description:
      'Een vrijwilligersuitje dat erkent én meet — rond Vrijwilligersdag of het Jaar van de Vrijwilliger.',
    url: '/vrijwilligers-uitje',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Vrijwilligersuitje met impact',
  provider: { '@type': 'Organization', name: 'IctusGo', url: 'https://ictusgo.nl' },
  name: 'Vrijwilligersuitje',
  description:
    'GPS-uitje voor vrijwilligers dat erkenning en verbinding combineert met meetbare GMS-impact, inzetbaar als dankdag of teamuitje.',
}

export default function VrijwilligersUitjePage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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
            <Gift className="w-3 h-3" /> Vrijwilligersuitje
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Een uitje dat<br />
            <span className="text-[#00E676]">méér is dan een uitje</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            Een vrijwilligersuitje hoeft geen borrel of bowlingavond te zijn. Maak er een
            betekenisvolle ervaring van — met erkenning, verbinding en impact die vrijwilligers
            nog weken daarna bijblijft.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/impact-vrijwilligers-dankdag"
              className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors"
            >
              Bekijk de Vrijwilligers Dankdag <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tochten"
              className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-7 py-3.5 rounded-2xl hover:bg-white/5 transition-colors"
            >
              Bekijk tochten
            </Link>
          </div>
        </div>
      </section>

      {/* ── FORMATEN ─────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Welk formaat past
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Drie manieren om een vrijwilligersuitje met impact te doen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: MapPin,
                t: 'WijkTocht',
                d: 'Een GPS-route door de buurt. Vrijwilligers ontdekken hun eigen werkterrein op een nieuwe manier — en elkaar.',
              },
              {
                icon: Heart,
                t: 'ImpactSprint',
                d: 'Compacte variant van 90 minuten. Maximale betekenis in korte tijd, ideaal voor drukke agenda\'s.',
              },
              {
                icon: Sparkles,
                t: 'Vrijwilligers Dankdag',
                d: 'Het volledige erkenningsprogramma: warm welkom, 6 checkpoints en een feestelijke afsluiting.',
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

      {/* ── WAAROM IMPACT ────────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Waarom met impact
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Een uitje wordt pas waardevol als het iets oplevert
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Vrijwilligers voelen concreet wat ze betekenen',
              'Verbinding tussen vrijwilligers onderling groeit',
              'De organisatie krijgt meetbare impactdata',
              'Foto\'s en verhalen voor eigen communicatie',
              'Een brug naar subsidie- en fondsenwerving',
              'Een ervaring die mensen doorvertellen — de beste werving',
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <PartyPopper className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span className="text-sm text-[#475569]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-[#00E676] px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Plan een vrijwilligersuitje dat blijft hangen
          </h2>
          <p className="text-[#0F172A]/70 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            De Impact Vrijwilligers Dankdag is het meest complete format — erkenning én
            meetbare impact in één middag.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/impact-vrijwilligers-dankdag"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Ontdek de Dankdag <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vrijwilligers-teambuilding"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Vrijwilligersteambuilding
            </Link>
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
            <Link href="/jaar-van-de-vrijwilliger-2026" className="hover:text-white transition-colors">
              Jaar van de Vrijwilliger
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
