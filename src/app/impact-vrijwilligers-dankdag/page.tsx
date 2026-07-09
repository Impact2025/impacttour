import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Heart,
  Sparkles,
  Users,
  Building2,
  Music,
  Home,
  HandHeart,
  MapPin,
  PartyPopper,
  FileText,
  Camera,
  Link2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Impact Vrijwilligers Dankdag — een dag van échte erkenning & impact',
  description:
    'Een betekenisvolle ervaring voor vrijwilligers: een GPS-tocht vol erkenning en verbinding, met concrete impactdata voor je organisatie. Ideaal rond Vrijwilligersdag.',
  alternates: { canonical: '/impact-vrijwilligers-dankdag' },
  openGraph: {
    title: 'Impact Vrijwilligers Dankdag — erkenning met impact',
    description:
      'Laat vrijwilligers voelen hoe waardevol ze zijn, en krijg concrete impactdata voor je organisatie.',
    url: '/impact-vrijwilligers-dankdag',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Vrijwilligersdankdag / erkenningsevent',
  provider: { '@type': 'Organization', name: 'IctusGo', url: 'https://ictusgo.nl' },
  name: 'Impact Vrijwilligers Dankdag',
  description:
    'Een GPS-teambuilding-ervaring rond Vrijwilligersdag die vrijwilligers erkent en verbindt, met automatische GMS-scores in het Daar.nl-dashboard en een professioneel impactrapport voor subsidieaanvragen.',
}

export default function ImpactVrijwilligersDankdagPage() {
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
            Plan de Dankdag
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            <Heart className="w-3 h-3" /> Impact Vrijwilligers Dankdag
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Een dag van échte erkenning,<br />
            <span className="text-[#00E676]">verbinding en impact</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            Speciaal voor de mensen die het verschil maken. Dit is niet zomaar een uitje — het
            is een betekenisvolle ervaring die vrijwilligers laat voelen hoe waardevol ze zijn,
            terwijl de organisatie concrete impactdata krijgt.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact?subject=vrijwilligers-dankdag"
              className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors"
            >
              Plan de Dankdag <ArrowRight className="w-4 h-4" />
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

      {/* ── DOELGROEP ────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Voor wie
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Eén formule, voor iedereen die op vrijwilligers leunt
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Building2, t: 'Gemeenten & welzijnsorganisaties' },
              { icon: Music, t: 'Sportverenigingen' },
              { icon: Sparkles, t: 'Cultuurinstellingen (musea, theaters)' },
              { icon: Home, t: 'Buurthuizen & zorginstellingen' },
              { icon: HandHeart, t: 'Sociale stichtingen' },
              { icon: Users, t: 'Alle teams mét vrijwilligers' },
            ].map(({ icon: Icon, t }) => (
              <div
                key={t}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#00E676]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#00A84A]" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A] leading-snug">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMMA ────────────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Uitgebreid programma
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-3"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Aanbevolen duur: 2,5 – 3,5 uur
          </h2>

          <div className="space-y-8 mt-10">
            {/* 1. Warm welkom */}
            <div className="flex flex-col md:flex-row gap-5">
              <div className="md:w-44 shrink-0">
                <span className="text-xs font-bold text-[#00A84A] uppercase tracking-widest">
                  Stap 1 · 20 min
                </span>
                <h3 className="text-xl font-black text-[#0F172A] mt-1">Warm welkom</h3>
              </div>
              <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
                <p className="text-sm text-[#475569] leading-relaxed">
                  Koffie/thee, iets lekkers en een persoonlijk welkomstwoord van bestuur of
                  coördinator. Vrijwilligers voelen vanaf minuut één: jij wordt gezien.
                </p>
              </div>
            </div>

            {/* 2. De tocht */}
            <div className="flex flex-col md:flex-row gap-5">
              <div className="md:w-44 shrink-0">
                <span className="text-xs font-bold text-[#00A84A] uppercase tracking-widest">
                  Stap 2 · 90–120 min
                </span>
                <h3 className="text-xl font-black text-[#0F172A] mt-1">
                  Impact Vrijwilligers Tocht
                </h3>
              </div>
              <div className="flex-1 space-y-4">
                <div className="bg-[#00E676]/5 border border-[#00E676]/20 rounded-2xl p-6">
                  <p className="text-sm text-[#475569] leading-relaxed mb-4">
                    <span className="font-bold text-[#0F172A]">5–7 zorgvuldig ontworpen checkpoints</span>{' '}
                    langs een GPS-route, met thema&apos;s die perfect aansluiten bij
                    Vrijwilligersdag — en direct gekoppeld aan de vier GMS-dimensies van
                    teamgeluk:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { d: 'Erkenning van eigen bijdrage', g: 'Betekenis' },
                      { d: 'Verbinding met medevrijwilligers', g: 'Verbinding' },
                      { d: 'Betekenis voor de samenleving', g: 'Betekenis' },
                      { d: 'Plezier & energie', g: 'Plezier' },
                      { d: 'Toekomst & groei', g: 'Groei' },
                    ].map(({ d, g }) => (
                      <div
                        key={d}
                        className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5"
                      >
                        <span className="text-sm text-[#0F172A]">{d}</span>
                        <span className="text-[10px] font-bold text-[#00A84A] bg-[#00E676]/10 px-2 py-1 rounded-full ml-3 whitespace-nowrap">
                          {g}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest pt-1">
                  Voorbeeld checkpoints — klaar voor gebruik
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      t: 'Het begin',
                      m: 'Maak een foto van iets in de buurt dat jou motiveert om vrijwilliger te zijn.',
                    },
                    {
                      t: 'Verbinding',
                      m: 'Deel met je team een moment waarop jullie samen iets moois hebben bereikt.',
                    },
                    {
                      t: 'Impact',
                      m: 'Wie heb je dit jaar geraakt? Leg het vast.',
                    },
                    {
                      t: 'Plezier',
                      m: 'Fun-opdracht + kleine viering onderweg.',
                    },
                    {
                      t: 'Dankbaarheid',
                      m: 'Schrijf een bedankje aan een medevrijwilliger — wordt later bezorgd.',
                    },
                    {
                      t: 'Toekomst',
                      m: 'Wat gun je jezelf en de organisatie volgend jaar?',
                    },
                  ].map(({ t, m }) => (
                    <div
                      key={t}
                      className="flex items-start gap-3 bg-white border border-[#E2E8F0] rounded-2xl p-5"
                    >
                      <MapPin className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A] mb-1">{t}</h4>
                        <p className="text-xs text-[#64748B] leading-relaxed">{m}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Afsluiting */}
            <div className="flex flex-col md:flex-row gap-5">
              <div className="md:w-44 shrink-0">
                <span className="text-xs font-bold text-[#00A84A] uppercase tracking-widest">
                  Stap 3 · 30–45 min
                </span>
                <h3 className="text-xl font-black text-[#0F172A] mt-1">Feestelijke afsluiting</h3>
              </div>
              <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
                <ul className="space-y-2.5">
                  {[
                    'Confetti-ontvangst',
                    'Persoonlijke scorekaarten + groepsrapport',
                    'Warm samenzijn met drankje & hapje',
                    'Optioneel: kleine attentie (gepersonaliseerd kaartje of bloem)',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#475569]">
                      <PartyPopper className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNISCHE MEERWAARDE ────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20 border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Technische meerwaarde
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Meer dan een mooie middag
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-4">
                <Link2 className="w-5 h-5 text-[#16a34a]" />
              </div>
              <h3 className="font-black text-[#0F172A] mb-2">Volledige Daar.nl-integratie</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Geluksmomenten en GMS-scores worden automatisch in het Daar.nl-dashboard
                geschreven. Geen dubbele invoer, direct inzicht voor coördinatoren.
              </p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h3 className="font-black text-[#0F172A] mb-2">Professioneel impactrapport</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Ideaal voor subsidieaanvragen in december/januari. Aantoonbare impact, netjes
                gerapporteerd per dimensie en per groep.
              </p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center mb-4">
                <Camera className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="font-black text-[#0F172A] mb-2">Eigen communicatie</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Foto&apos;s en video&apos;s van de dag zijn direct beschikbaar voor jullie
                communicatie rond Vrijwilligersdag.
              </p>
            </div>
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
            Laat je vrijwilligers voelen hoe waardevol ze zijn
          </h2>
          <p className="text-[#0F172A]/70 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Plan de Impact Vrijwilligers Dankdag en krijg erkenning én impactdata in één middag.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact?subject=vrijwilligers-dankdag"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Plan de Dankdag <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tochten"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Bekijk tochten
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
            <Link href="/maatschappelijk-teamuitje" className="hover:text-white transition-colors">
              Maatschappelijk teamuitje
            </Link>
            <Link href="/gps-teamuitje" className="hover:text-white transition-colors">
              GPS-teamuitje
            </Link>
            <Link href="/impact" className="hover:text-white transition-colors">
              Impact & GMS
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
