import { ArrowRight, MapPin, Zap, Heart, Shield, Star, Trophy } from 'lucide-react'
import Link from 'next/link'
import { SiteNav } from '@/components/layout/site-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IctusGo — GPS Teambuilding met Sociale Impact',
  description:
    'GPS-gestuurde outdoor teambuilding met meetbare sociale impact. Voor bedrijven, scholen en gezinnen. Kies je variant en boek direct.',
  openGraph: {
    title: 'IctusGo — GPS Teambuilding met Sociale Impact',
    description: 'GPS-gestuurde outdoor teambuilding met meetbare sociale impact.',
    url: '/',
  },
}

const VARIANTS = [
  { icon: MapPin,  color: '#3B82F6', name: 'WijkTocht',     desc: 'Bedrijven & teams, GPS door de buurt' },
  { icon: Zap,     color: '#8B5CF6', name: 'ImpactSprint',  desc: 'Compact, 90 min, maximale impact' },
  { icon: Heart,   color: '#EC4899', name: 'FamilieTocht',  desc: 'Gezinnen & koppels, weekendscore' },
  { icon: Shield,  color: '#F59E0B', name: 'JeugdTocht',    desc: '9-13 jaar, AVG-compliant, geofenced' },
  { icon: Trophy,  color: '#EF4444', name: 'VoetbalMissie', desc: 'Voetbal-thema, 9-12 jaar, €6/kind' },
]

const STATS = [
  { value: '500+',    label: 'Voltooide sessies' },
  { value: '12.000+', label: 'GMS momenten' },
  { value: '2.400+',  label: 'Teams verbonden' },
  { value: '5',       label: 'Varianten' },
]

const HOW = [
  { step: '01', title: 'Kies je variant',      desc: 'Van WijkTocht voor bedrijven tot VoetbalMissie voor jeugd — er is altijd een passende tocht.' },
  { step: '02', title: 'Boek & betaal',         desc: 'Veilig betalen via MultiSafepay. Direct je bevestiging en setup-link in je mailbox.' },
  { step: '03', title: 'Speel & scoor',         desc: 'Teams navigeren via GPS langs checkpoints. AI-assistent begeleidt, live scorebord motiveert.' },
  { step: '04', title: 'Ontvang je impact',     desc: 'Na afloop: persoonlijk Coach Inzicht, GMS-score en een volledig PDF-impactrapport.' },
]

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <div className="bg-white">

        {/* ── Hero ── */}
        <section className="bg-[#0F172A] px-4 md:px-8 pt-20 pb-24 md:pt-28 md:pb-32 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto text-center relative">
            <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
              GPS Teambuilding met meetbare impact
            </span>
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black italic text-white leading-[0.95] mb-6"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Buiten spelen.<br />
              <span className="text-[#00E676]">Impact meten.</span>
            </h1>
            <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              IctusGo is een GPS-gestuurd outdoor spel dat verbinding, betekenis, plezier en groei meet.
              Voor bedrijven, scholen en gezinnen — door heel Nederland.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link
                href="/tochten"
                className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-black px-8 py-4 rounded-2xl hover:bg-[#00C853] transition-colors text-base"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Bekijk alle tochten <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/over-ons"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/5 transition-colors text-base"
              >
                Ons verhaal
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {STATS.map(({ value, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div
                    className="text-3xl md:text-4xl font-black text-[#00E676] mb-1"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {value}
                  </div>
                  <p className="text-[#94A3B8] text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Varianten ── */}
        <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">5 varianten</p>
            <h2
              className="text-3xl md:text-5xl font-black text-[#0F172A] mb-3"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Er is altijd een passende tocht.
            </h2>
            <p className="text-[#64748B] text-base mb-10 max-w-2xl">
              Van compacte bedrijfsuitje tot AVG-compliant kinderspel — kies de variant die bij jullie groep past.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {VARIANTS.map(({ icon: Icon, color, name, desc }) => (
                <Link
                  key={name}
                  href="/tochten"
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:border-[#00E676]/40 hover:shadow-md transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3
                    className="font-black text-[#0F172A] text-lg mb-1 group-hover:text-[#00C853] transition-colors"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {name}
                  </h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/tochten" className="inline-flex items-center gap-2 text-[#00C853] font-semibold text-sm hover:underline">
                Alle tochten bekijken <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Hoe werkt het ── */}
        <section className="bg-white px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">In 4 stappen</p>
            <h2
              className="text-3xl md:text-5xl font-black text-[#0F172A] mb-12"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Van boeking tot impactrapport.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HOW.map(({ step, title, desc }) => (
                <div key={step} className="flex gap-5">
                  <div
                    className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center shrink-0 text-[#00E676] font-black text-sm"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {step}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] mb-1">{title}</h3>
                    <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof ── */}
        <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { quote: 'Na de tocht hadden we ineens gesprekken die we in jaren vergadering niet voor elkaar kregen.', org: 'Gemeente Rotterdam', initials: 'GR', color: '#3B82F6', gms: 78 },
                { quote: 'Onze trainer zag kinderen samenwerken die normaal op verschillende groepjes zitten.', org: 'Voetbalclub VV Spirit', initials: 'VS', color: '#00E676', gms: 84 },
                { quote: 'De kinderen praten er nog weken over. Beter dan welke schoolreis ook.', org: 'Basisschool De Sprong', initials: 'DS', color: '#F59E0B', gms: 71 },
              ].map(({ quote, org, initials, color, gms }) => (
                <div key={org} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />)}
                  </div>
                  <blockquote className="text-[#0F172A] text-sm leading-relaxed italic mb-5">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: color }}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] text-sm">{org}</p>
                      <p className="text-[10px] text-[#00C853] font-bold">GMS {gms}%</p>
                    </div>
                  </div>
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
              Klaar om impact te maken?
            </h2>
            <p className="text-[#0F172A]/60 text-base mb-8 max-w-md mx-auto">
              Boek direct een tocht of vraag een demo aan. Wij helpen je de perfecte variant te kiezen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/tochten"
                className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
              >
                Bekijk alle tochten <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
              >
                Plan een demo call
              </Link>
            </div>
          </div>
        </section>

      </div>
      <SiteFooter />
    </>
  )
}
