import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, Heart, Users, Sparkles, Target, FileText, Link2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vrijwilligers Teambuilding 2026 | Verbinding die retentie oplevert',
  description:
    'Teambuilding voor vrijwilligers werkt anders dan voor personeel. Ontdek hoe verbinding, erkenning en meetbare impact vrijwilligers binden — en hoe de Impact Vrijwilligers Dankdag dat concreet maakt.',
  alternates: { canonical: '/vrijwilligers-teambuilding' },
  openGraph: {
    title: 'Vrijwilligers Teambuilding 2026 | Verbinding die retentie oplevert',
    description:
      'Waarom vrijwilligersteams ook teambuilding nodig hebben — en hoe je het meetbaar maakt.',
    url: '/vrijwilligers-teambuilding',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Teambuilding voor vrijwilligers',
  provider: { '@type': 'Organization', name: 'IctusGo', url: 'https://ictusgo.nl' },
  name: 'Vrijwilligers Teambuilding',
  description:
    'GPS-teambuilding specifiek ontworpen voor vrijwilligersteams: verbinding, erkenning en meetbare GMS-impact, gekoppeld aan retentie en welzijn.',
}

export default function VrijwilligersTeambuildingPage() {
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
            <Users className="w-3 h-3" /> Vrijwilligers Teambuilding
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            VrijwilligersTeams<br />
            <span className="text-[#00E676]">hebben ook teambuilding</span>
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed mb-8">
            Vrijwilligers kies je niet zomaar uit — en ze blijven niet vanzelf. Verbinding,
            erkenning en het gevoel ergens toe te doen, zijn de lijm van elk vrijwilligersteam.
            Precies daar zit de kracht van gerichte teambuilding.
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

      {/* ── WAAROM ANDERS ────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Waarom anders dan personeel
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10 max-w-2xl"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Drie redenen waarom vrijwilligersteams teambuilding nodig hebben
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Heart,
                t: 'Retentie',
                d: 'Vrijwilligers vertrekken stil. Een team dat elkaar kent en waardeert, blijft. Verbinding is de goedkoopste retentiemaatregel die er is.',
              },
              {
                icon: Sparkles,
                t: 'Erkenning',
                d: 'Vrijwilligers werken uit overtuiging, niet voor geld. Echte erkenning — niet alleen een bedankje — is wat hen doet terugkomen.',
              },
              {
                icon: Target,
                t: 'Welzijn',
                d: 'Vrijwilligerswerk kan belasten. Teambuilding die ontspant en energie geeft, voorkomt burn-out en houdt inzet volhoudbaar.',
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

      {/* ── WAT WERKT ÉCHT ───────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Wat werkt écht
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Teambuilding die vrijwilligers niet als verplichting voelt
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Samen bewegen in de buurt, niet in een zaal zitten',
              'Opdrachten die hun inzet zichtbaar maken',
              'Meting van verbinding, betekenis, plezier en groei (GMS)',
              'Een afsluiting met persoonlijke erkenning',
              'Ruimte voor ontspanning, niet nóg een vergadering',
              'Direct bruikbaar voor subsidie- en impactrapportage',
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                <span className="text-sm text-[#475569]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEERWAARDE ───────────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20 border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Meetbaar
          </p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Wat je er daadwerkelijk aan overhoudt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-4">
                <Link2 className="w-5 h-5 text-[#16a34a]" />
              </div>
              <h3 className="font-black text-[#0F172A] mb-2">GMS-dashboard</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Verbinding, betekenis, plezier en groei uitgesplitst per team — direct inzicht
                voor coördinatoren, zonder dubbele invoer.
              </p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h3 className="font-black text-[#0F172A] mb-2">Impactrapport</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Aantoonbare impact per dimensie en per groep — ideaal voor subsidieaanvragen in
                december en januari.
              </p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center mb-4">
                <Heart className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="font-black text-[#0F172A] mb-2">Echte erkenning</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Een programma dat vrijwilligers laat voelen hoe waardevol ze zijn — de basis
                van blijvende inzet.
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
            Geef jouw vrijwilligersteam de verbinding die het verdient
          </h2>
          <p className="text-[#0F172A]/70 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            De Impact Vrijwilligers Dankdag combineert teambuilding, erkenning en meetbare
            impact in één middag.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/impact-vrijwilligers-dankdag"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Ontdek de Dankdag <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vrijwilligers-uitje"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Vrijwilligersuitjes
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
