import { ArrowRight, Heart, Target, Zap } from 'lucide-react'
import Link from 'next/link'

const TEAM = [
  { name: 'Michiel van Munster', role: 'Oprichter & Visie', initials: 'MV', color: '#00E676' },
  { name: 'Lisa de Jong',        role: 'Impact Design',     initials: 'LJ', color: '#EC4899' },
  { name: 'Tom Bakker',          role: 'Tech & Innovatie',  initials: 'TB', color: '#8B5CF6' },
  { name: 'Sara Ahmed',          role: 'Community & Groei', initials: 'SA', color: '#F59E0B' },
]

const TIMELINE = [
  { year: '2010', title: 'Eerste stap', desc: 'WeAreImpact opgericht als sociaal ondernemer in teambuilding met maatschappelijke impact.' },
  { year: '2015', title: 'GPS pionieren', desc: 'Eerste GPS-gestuurde buurtactiviteit voor gemeenten en corporaties in Rotterdam en Utrecht.' },
  { year: '2019', title: 'JeugdTocht',   desc: 'Lancering JeugdTocht — AVG-compliant GPS-spel voor kinderen van 9-13 jaar.' },
  { year: '2022', title: 'VoetbalMissie',desc: 'Samenwerking met voetbalclubs: de VoetbalMissie bereikt 5.000+ kinderen.' },
  { year: '2024', title: 'IctusGo',      desc: 'Volledige digitale transformatie: IctusGo platform met AI-begeleiding en GMS meting live.' },
  { year: '2025', title: 'Schaalsprong', desc: 'Marketplace, 5 varianten, partnerships met scholen, gemeenten en bedrijven door heel Nederland.' },
]

const IMPACT_NUMBERS = [
  { label: 'Sessies gespeeld', value: '500+', sub: 'en groeiend' },
  { label: 'GMS scores gegeven', value: '12.000+', sub: 'impact momenten' },
  { label: 'Teams verbonden', value: '2.400+', sub: 'teams landelijk' },
  { label: 'Jaar actief', value: '15', sub: 'sociaal ondernemen' },
]

export default function OverOnsPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#0d2018] to-[#0F172A] px-4 md:px-8 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            Ons verhaal
          </span>
          <h1
            className="text-5xl md:text-7xl font-black italic text-white leading-[1.0] mb-6"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Waarom<br />
            <span className="text-[#00E676]">IctusGo?</span>
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto leading-relaxed">
            Wij geloven dat echte verbinding ontstaat in beweging — buiten, in de wijk, met vreemden en bekenden.
            IctusGo maakt dat meetbaar en deelwaardig.
          </p>
        </div>
      </section>

      {/* ── Missie ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Onze missie</p>
          <blockquote
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] leading-tight mb-8 border-l-4 border-[#00E676] pl-6"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            &ldquo;Elke tocht laat mensen iets nieuws ontdekken — over hun buurt, over hun team, over zichzelf.&rdquo;
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Heart,   color: '#EC4899', title: 'Verbinding',  desc: 'We brengen mensen samen die anders nooit zouden praten. Dwars door grenzen van leeftijd, cultuur en achtergrond.' },
              { icon: Target,  color: '#8B5CF6', title: 'Meten',       desc: 'De Geluksmomenten Score (GMS) maakt impact zichtbaar — niet als gevoel, maar als data.' },
              { icon: Zap,     color: '#00E676', title: 'Bewegen',     desc: 'Buiten, in beweging, met GPS. Actieve ervaringen beklijven beter dan teambuilding in een vergaderzaal.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-bold text-[#0F172A] mb-2">{title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Het team</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Mensen achter de missie.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEAM.map(({ name, role, initials, color }) => (
              <div key={name} className="bg-[#F8FAFC] rounded-2xl p-5 text-center border border-[#E2E8F0]">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-black text-[#0F172A]"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <p className="font-bold text-[#0F172A] text-sm">{name}</p>
                <p className="text-[#94A3B8] text-xs mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tijdlijn ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Ons verhaal</p>
          <h2
            className="text-3xl md:text-4xl font-black text-[#0F172A] mb-12"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            15 jaar in beweging.
          </h2>

          <div className="space-y-0">
            {TIMELINE.map(({ year, title, desc }, i) => (
              <div key={year} className="flex gap-6">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0">
                    <span className="text-[#00E676] text-xs font-black">{year.slice(2)}</span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-0.5 flex-1 bg-[#E2E8F0] mt-1 mb-1 min-h-[32px]" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest mb-0.5">{year}</p>
                  <h3 className="font-bold text-[#0F172A] mb-1">{title}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Numbers ── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Impact in cijfers</p>
          <h2
            className="text-3xl md:text-5xl font-black text-white mb-12"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Meetbare resultaten.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {IMPACT_NUMBERS.map(({ label, value, sub }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div
                  className="text-4xl font-black text-[#00E676] mb-1"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {value}
                </div>
                <p className="text-white text-sm font-bold">{label}</p>
                <p className="text-[#64748B] text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#00E676] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Klaar om samen impact te maken?
          </h2>
          <p className="text-[#0F172A]/60 text-base mb-8 max-w-md mx-auto">
            Ontdek onze varianten of neem direct contact met ons op voor een demo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tochten"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Bekijk varianten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Neem contact op
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
