import Link from 'next/link'
import { Navigation, Grid3x3, Heart, Trophy, Quote, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00E676] flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#0F172A]" strokeWidth={2.5} />
            </div>
            <span
              className="font-black text-[#0F172A] text-sm tracking-tight"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              IMPACT FC
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-sm text-[#64748B]">
            <a href="#features" className="hover:text-[#0F172A] transition-colors">Functies</a>
            <a href="#overzicht" className="hover:text-[#0F172A] transition-colors">Overzicht</a>
            <a href="#varianten" className="hover:text-[#0F172A] transition-colors">Varianten</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/join"
              className="hidden md:block text-sm font-medium text-[#64748B] hover:text-[#0F172A] px-3 py-1.5 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/tochten"
              className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors"
            >
              Start nu missie
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:gap-16">

          {/* Hero card (mobile-first card, desktop: plain text) */}
          <div className="flex-1">
            <div className="bg-[#0F172A] rounded-3xl p-6 md:bg-transparent md:rounded-none md:p-0">

              <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
                Voetbal met een Missie
              </span>

              <h1
                className="text-[2.6rem] md:text-6xl font-black italic text-white md:text-[#0F172A] leading-[1.05] mb-4"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Maak Impact op<br />
                en naast het veld
              </h1>

              <p className="text-[#94A3B8] md:text-[#64748B] text-sm md:text-base leading-relaxed mb-6 max-w-md">
                Verander elke voetbalwedstrijd in een sociale missie. Voor de helden van de toekomst.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/tochten"
                  className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-6 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors"
                >
                  Start nu gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/join"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 md:border-[#E2E8F0] text-[#94A3B8] md:text-[#64748B] font-medium text-sm px-6 py-3.5 rounded-2xl hover:bg-white/5 md:hover:bg-[#F8FAFC] transition-colors"
                >
                  Doe mee aan tocht
                </Link>
              </div>

              <p className="text-[#64748B] text-xs mt-4">
                Een onbeperkt sociaal impact · 100% impact meting
              </p>
            </div>
          </div>

          {/* Phone mockup — desktop only */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-56 h-[460px] bg-[#0F172A] rounded-[42px] border-[5px] border-[#1E293B] shadow-2xl shadow-[#0F172A]/40 overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0F172A] rounded-b-2xl z-10" />
              {/* Screen content */}
              <div className="flex-1 bg-gradient-to-b from-[#0F172A] via-[#0d1f0d] to-[#0F172A] flex flex-col items-center justify-center px-5 pt-8 pb-4 gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#00E676] flex items-center justify-center mb-1">
                  <Navigation className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Geluksmomenten</div>
                  <div
                    className="text-4xl font-black text-white"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    12.450+
                  </div>
                  <div className="text-[#00E676] text-xs font-bold mt-0.5">+75%</div>
                </div>
                {/* Avatar row */}
                <div className="flex -space-x-2 mt-1">
                  {['#EC4899', '#8B5CF6', '#F59E0B', '#00E676', '#3B82F6'].map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#0F172A]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                {/* Score card */}
                <div className="w-full bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl p-3 text-center">
                  <div className="text-[#00E676] text-[10px] font-bold uppercase tracking-widest mb-0.5">GMS Score</div>
                  <div
                    className="text-white text-3xl font-black"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    87/100
                  </div>
                  <div className="text-[#64748B] text-[9px] mt-0.5">⭐ Hoge Impact Badge</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <section className="bg-white border-y border-[#E2E8F0] py-6 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Geluksmomenten</p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                12.450+
              </span>
              <span className="text-[#00C853] text-xs font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">+75%</span>
            </div>
          </div>

          <div className="flex -space-x-2">
            {['#EC4899', '#8B5CF6', '#F59E0B', '#00E676', '#3B82F6'].map((c, i) => (
              <div key={i} className="w-9 h-9 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
            ))}
          </div>

          <div className="hidden md:flex gap-12">
            <div className="text-center">
              <div
                className="text-2xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                1.2M+
              </div>
              <div className="text-xs text-[#94A3B8]">Bereikte mensen</div>
            </div>
            <div className="text-center">
              <div
                className="text-2xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                500K+
              </div>
              <div className="text-xs text-[#94A3B8]">Missies voltooid</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">

          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Speel voor de winst,<br />
            <span className="relative inline-block">
              win voor de wereld.
              <span className="absolute -bottom-0.5 left-0 right-0 h-[3px] bg-[#00E676] rounded-full" />
            </span>
          </h2>

          <p className="text-[#64748B] text-sm md:text-base mt-5 mb-10 max-w-xl">
            ImpactTocht combineert GPS-avontuur met echte maatschappelijke impact.
            Teams scoren punten én maken verschil in de buurt.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="overzicht">
            {[
              {
                Icon: Grid3x3,
                iconColor: '#00E676',
                iconBg: '#00E67615',
                title: 'Missie Dashboard',
                desc: 'Houd al je sociale doelen en maatschappelijke projecten bij in één overzicht. Zie direct wat jouw impact is.',
              },
              {
                Icon: Heart,
                iconColor: '#EC4899',
                iconBg: '#EC489915',
                title: 'Geluksmomenten Score',
                desc: 'Verzamel punten voor positief gedrag, sportiviteit en hulp aan anderen. De score die er écht toe doet.',
              },
              {
                Icon: Trophy,
                iconColor: '#F59E0B',
                iconBg: '#F59E0B15',
                title: 'Team Rankings',
                desc: 'Strijd met je team voor de hoogste plek in de landelijke impact-competitie. Samen staan we sterker.',
              },
            ].map(({ Icon, iconColor, iconBg, title, desc }) => (
              <div key={title} className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#00E676]/30 transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <h3 className="font-bold text-[#0F172A] text-sm mb-1.5">{title}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark stats ─────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:gap-20">
          <div className="flex-1 mb-10 md:mb-0">
            <h2
              className="text-3xl md:text-5xl font-black text-white leading-tight mb-4"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              We maken het<br />
              <span className="text-[#00E676]">onzichtbare</span> zichtbaar.
            </h2>
            <p className="text-[#64748B] text-sm md:text-base max-w-md">
              Onze sociale missies meten actieve impact op omgeving en team.
              Via onze innovatieve mobiele app word elke wedstrijd raker.
              Nu al MVP van je community.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:w-[340px] shrink-0">
            <div className="bg-[#00E676]/10 border border-[#00E676]/20 rounded-2xl p-5">
              <div
                className="text-3xl font-black text-[#00E676] mb-0.5"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                1.2M+
              </div>
              <div className="text-[#94A3B8] text-xs">Bereikte mensen</div>
              <div className="text-[#00E676] text-xs font-bold mt-1.5">+12% dit kwartaal</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div
                className="text-3xl font-black text-white mb-0.5"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                500K+
              </div>
              <div className="text-[#94A3B8] text-xs">Missies voltooid</div>
              <div className="text-[#94A3B8] text-xs font-bold mt-1.5">+8% dit kwartaal</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="varianten" className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Hoe het werkt</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            In drie stappen naar impact.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Download de App',
                desc: 'Scan de QR-code van je spelleider of voer je teamcode in. Klaar in 30 seconden, geen account nodig.',
              },
              {
                step: '02',
                title: 'Speel de Game',
                desc: 'Navigeer via GPS naar checkpoints en voltooi sociale opdrachten onderweg. Verdien Geluksmomenten.',
              },
              {
                step: '03',
                title: 'Maak Impact',
                desc: 'Het rapport meet verbinding, betekenis, plezier en groei. Zie jullie echte maatschappelijke impact.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
                    <span className="text-xs font-black text-[#00C853]">{step}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm mb-1.5">{title}</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <Quote className="w-8 h-8 text-[#00E676] mb-5" />
            <p
              className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-7"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              &ldquo;Dankzij Impact Football zien mijn spelers dat er meer zijn dan alleen voetballers.
              Ze leren verantwoordelijkheid en empathie, terwijl ze nog steeds elke week
              keihard strijden voor de overwinning.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00E676]/15 border border-[#00E676]/20 flex items-center justify-center">
                <span className="text-[#00E676] text-xs font-black">MV</span>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Mark de Vries</p>
                <p className="text-[#64748B] text-xs uppercase tracking-wide">Hoofdcoach O11 · AFC Amsterdam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="bg-[#00E676] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Klaar om de wereld<br />te veranderen?
          </h2>
          <p className="text-[#0F172A]/60 text-sm md:text-base mb-7 max-w-sm mx-auto">
            Sluit je aan bij duizenden jonge spelers die al impact maken.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/tochten"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Sluit je aan bij de community
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Alle niveaus ↗
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-[#0F172A]/50 text-xs">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Gratis start</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Alle niveaus</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#00E676] flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-[#0F172A]" strokeWidth={2.5} />
                </div>
                <span
                  className="font-black text-white text-sm"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  IMPACT FOOTBALL
                </span>
              </div>
              <p className="text-[#64748B] text-xs max-w-xs leading-relaxed">
                GPS-gestuurd teambuilding met echte sociale impact.
                Voor bedrijven, scholen en gezinnen.
              </p>
            </div>

            {/* Links — desktop */}
            <div className="hidden md:grid grid-cols-3 gap-12 text-xs">
              <div>
                <p className="text-white font-bold mb-3">Product</p>
                <div className="space-y-2 text-[#64748B]">
                  <p>Varianten</p>
                  <p>Functies</p>
                  <p>Rapport</p>
                  <p>Bookings</p>
                </div>
              </div>
              <div>
                <p className="text-white font-bold mb-3">Bedrijf</p>
                <div className="space-y-2 text-[#64748B]">
                  <p>Over ons</p>
                  <p>Impact Rapport</p>
                  <p>Partner worden</p>
                </div>
              </div>
              <div>
                <p className="text-white font-bold mb-3">Help je mee</p>
                <div className="space-y-2 text-[#64748B]">
                  <p>Contact</p>
                  <p>FAQ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row md:justify-between gap-2 text-xs text-[#475569]">
            <p>© {new Date().getFullYear()} Impact Football Foundation. Gebouwd met ♥ voor de applicatie.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
              <span className="cursor-pointer hover:text-white transition-colors">Algemene Voorwaarden</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
