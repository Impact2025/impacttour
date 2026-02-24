import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Heart,
  Trophy,
  Quote,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
  Shield,
  Footprints,
  Target,
  Sliders,
  type LucideIcon,
} from 'lucide-react'

const VARIANTS: Array<{
  icon: LucideIcon
  slug: string
  name: string
  target: string
  desc: string
  color: string
  bg: string
}> = [
  {
    icon: MapPin,
    slug: 'wijktocht',
    name: 'WijkTocht',
    target: 'Bedrijven & teams',
    desc: 'GPS-opdrachten in de buurt. Teams verbinden met hun omgeving én met elkaar.',
    color: '#3B82F6',
    bg: '#3B82F615',
  },
  {
    icon: Zap,
    slug: 'impactsprint',
    name: 'ImpactSprint',
    target: 'Compact · 90 min',
    desc: '5 checkpoints, 500m radius. Maximale impact in minimale tijd voor drukke agenda\'s.',
    color: '#8B5CF6',
    bg: '#8B5CF615',
  },
  {
    icon: Heart,
    slug: 'familietocht',
    name: 'FamilieTocht',
    target: 'Gezinnen · weekend',
    desc: 'Ontdek je buurt als gezin. Scoor de Familie Geluksscore en maak echte herinneringen.',
    color: '#EC4899',
    bg: '#EC489915',
  },
  {
    icon: Shield,
    slug: 'jeugdtocht',
    name: 'JeugdTocht',
    target: 'Kinderen 9-13 jaar',
    desc: 'Veilig GPS-avontuur met geofencing. Flits de assistent helpt kids onderweg.',
    color: '#F59E0B',
    bg: '#F59E0B15',
  },
  {
    icon: Target,
    slug: 'voetbalmissie',
    name: 'VoetbalMissie',
    target: 'Voetbalclubs · scholen',
    desc: '5 sociale checkpoints rondom het veld. Leer empathie terwijl je keihard speelt.',
    color: '#00E676',
    bg: '#00E67615',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Onze teamdag was nog nooit zo memorabel. De combinatie van GPS-avontuur en sociale opdrachten bracht mensen samen die anders nooit zouden praten.',
    name: 'Sandra Hoekstra',
    role: 'HR Manager · Gemeente Rotterdam',
    initials: 'SH',
  },
  {
    quote:
      'Mijn kinderen praten nu nog over de FamilieTocht van vorige zomer. Ze leerden iets over hun eigen wijk én over samenwerken.',
    name: 'Pieter van Dam',
    role: 'Deelnemer FamilieTocht · Utrecht',
    initials: 'PV',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-sm text-[#64748B]">
            <a href="#varianten" className="hover:text-[#0F172A] transition-colors">Varianten</a>
            <a href="#hoe-het-werkt" className="hover:text-[#0F172A] transition-colors">Hoe het werkt</a>
            <a href="#impact" className="hover:text-[#0F172A] transition-colors">Impact</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden md:block text-sm font-medium text-[#64748B] hover:text-[#0F172A] px-3 py-1.5 transition-colors"
            >
              Inloggen
            </Link>
            <Link
              href="/tochten"
              className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors"
            >
              Boek een tocht
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] px-4 md:px-8 py-10 md:py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:gap-16">

          {/* Hero tekst */}
          <div className="flex-1">
            <div className="bg-[#0F172A] rounded-3xl p-6 md:bg-transparent md:rounded-none md:p-0">

              <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
                GPS Teambuilding met Impact
              </span>

              <h1
                className="text-[2.6rem] md:text-6xl font-black italic text-white md:text-[#0F172A] leading-[1.05] mb-4"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Ontdek je buurt,<br />
                maak echte impact.
              </h1>

              <p className="text-[#94A3B8] md:text-[#64748B] text-sm md:text-base leading-relaxed mb-6 max-w-md">
                IctusGo combineert GPS-avontuur met sociale missies. Voor bedrijven, gezinnen,
                scholen en voetbalclubs — in 5 varianten die passen bij jouw groep.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/tochten"
                  className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-6 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors"
                >
                  Kies jouw variant
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/join"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 md:border-[#E2E8F0] text-[#94A3B8] md:text-[#64748B] font-medium text-sm px-6 py-3.5 rounded-2xl hover:bg-white/5 md:hover:bg-[#F8FAFC] transition-colors"
                >
                  Doe mee aan tocht
                </Link>
              </div>

              <p className="text-[#64748B] text-xs mt-4 md:text-[#94A3B8]">
                5 varianten · GPS-navigatie · AI-begeleiding · Impact meten
              </p>
            </div>
          </div>

          {/* Phone mockup — desktop only */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-56 h-[460px] bg-[#0F172A] rounded-[42px] border-[5px] border-[#1E293B] shadow-2xl shadow-[#0F172A]/40 overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0F172A] rounded-b-2xl z-10" />
              {/* Screen content */}
              <div className="flex-1 bg-gradient-to-b from-[#0F172A] via-[#0d1a1f] to-[#0F172A] flex flex-col items-center justify-center px-5 pt-8 pb-4 gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#00E676] flex items-center justify-center mb-1">
                  <MapPin className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Checkpoint 3/5</div>
                  <div
                    className="text-4xl font-black text-white"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    87m
                  </div>
                  <div className="text-[#00E676] text-xs font-bold mt-0.5">Bijna daar!</div>
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
                  <div className="text-[#64748B] text-[9px] mt-0.5">Hoge Impact Badge</div>
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
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Actief als sociaal ondernemer</p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                2010
              </span>
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
                15 jaar
              </div>
              <div className="text-xs text-[#94A3B8]">Praktijkervaring</div>
            </div>
            <div className="text-center">
              <div
                className="text-2xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                5
              </div>
              <div className="text-xs text-[#94A3B8]">Varianten beschikbaar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Varianten ──────────────────────────────────────────────── */}
      <section id="varianten" className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">

          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Voor iedereen</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Kies jouw variant.
          </h2>
          <p className="text-[#64748B] text-sm md:text-base mb-10 max-w-xl">
            Van 90 minuten ImpactSprint tot een familiedag — er is een IctusGo variant voor elke groep en elk doel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VARIANTS.map(({ icon: Icon, name, target, desc, color, bg, slug }) => (
              <div
                key={slug}
                className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#00E676]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-sm">{name}</h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color }}
                    >
                      {target}
                    </span>
                  </div>
                </div>
                <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
                {slug === 'voetbalmissie' && (
                  <Link
                    href="/voetbalmissie"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00E676] mt-3 group-hover:underline"
                  >
                    Meer over VoetbalMissie <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}

            {/* Maatwerk kaart */}
            <div className="bg-[#0F172A] rounded-2xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Sliders className="w-5 h-5 text-white" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Maatwerk tocht</h3>
              <p className="text-[#94A3B8] text-xs leading-relaxed mb-3">
                Eigen locaties, eigen opdrachten, eigen branding. Wij bouwen de tocht die bij jou past.
              </p>
              <Link
                href="/tochten"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00E676]"
              >
                Neem contact op <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="impact" className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">

          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Waarom IctusGo</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Speel samen,<br />
            <span className="relative inline-block">
              meet echte impact.
              <span className="absolute -bottom-0.5 left-0 right-0 h-[3px] bg-[#00E676] rounded-full" />
            </span>
          </h2>

          <p className="text-[#64748B] text-sm md:text-base mt-5 mb-10 max-w-xl">
            IctusGo meet verbinding, betekenis, plezier en groei — via de Geluksmomenten Score.
            Elke tocht eindigt met een persoonlijk impactrapport.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                Icon: MapPin,
                iconColor: '#00E676',
                iconBg: '#00E67615',
                title: 'GPS Navigatie',
                desc: 'Echte checkpoints op de kaart. Teams navigeren zelfstandig via hun telefoon.',
              },
              {
                Icon: Heart,
                iconColor: '#EC4899',
                iconBg: '#EC489915',
                title: 'Geluksmomenten Score',
                desc: '4 dimensies: verbinding, betekenis, plezier, groei. Max 100 punten per checkpoint.',
              },
              {
                Icon: Zap,
                iconColor: '#8B5CF6',
                iconBg: '#8B5CF615',
                title: 'AI Begeleiding',
                desc: 'Scout, Buddy of Flits evalueren antwoorden en geven hints op maat.',
              },
              {
                Icon: Trophy,
                iconColor: '#F59E0B',
                iconBg: '#F59E0B15',
                title: 'Live Scorebord',
                desc: 'Realtime klassement voor de spelleider. Teams zien hun positie direct na inzending.',
              },
            ].map(({ Icon, iconColor, iconBg, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#00E676]/30 transition-colors">
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
              Na elke tocht krijgt elke deelnemer een persoonlijk Coach Insight.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:w-[340px] shrink-0">
            <div className="bg-[#00E676]/10 border border-[#00E676]/20 rounded-2xl p-5">
              <div
                className="text-3xl font-black text-[#00E676] mb-0.5"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                2010
              </div>
              <div className="text-[#94A3B8] text-xs">Oprichtingsjaar</div>
              <div className="text-[#00E676] text-xs font-bold mt-1.5">Sociaal ondernemen</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div
                className="text-3xl font-black text-white mb-0.5"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                15 jaar
              </div>
              <div className="text-[#94A3B8] text-xs">Praktijkervaring</div>
              <div className="text-[#94A3B8] text-xs font-bold mt-1.5">Ontwikkeld in de praktijk</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div
                className="text-3xl font-black text-white mb-0.5"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                5
              </div>
              <div className="text-[#94A3B8] text-xs">Varianten</div>
              <div className="text-[#94A3B8] text-xs font-bold mt-1.5">Elke groep past</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div
                className="text-3xl font-black text-white mb-0.5"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                100
              </div>
              <div className="text-[#94A3B8] text-xs">Max GMS per CP</div>
              <div className="text-[#94A3B8] text-xs font-bold mt-1.5">AI-beoordeeld</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ──────────────────────────────────────────── */}
      <section id="hoe-het-werkt" className="bg-white px-4 md:px-8 py-14 md:py-20">
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
                Icon: Footprints,
                title: 'Boek of scan',
                desc: 'De organisator boekt een tocht, teams scannen de QR-code of voeren hun teamcode in. Klaar in 30 seconden.',
              },
              {
                step: '02',
                Icon: MapPin,
                title: 'Navigeer & voltooi',
                desc: 'Via GPS naar checkpoints. Beantwoord sociale opdrachten, maak foto\'s en verdien Geluksmomenten.',
              },
              {
                step: '03',
                Icon: Users,
                title: 'Zie jullie impact',
                desc: 'Het impactrapport toont verbinding, betekenis, plezier en groei. Met een persoonlijk Coach Insight per team.',
              },
            ].map(({ step, Icon, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#00C853]" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#00E676] uppercase tracking-widest mb-1">{step}</p>
                  <h3 className="font-bold text-[#0F172A] text-sm mb-1.5">{title}</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kids veiligheid callout ─────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0F172A] rounded-3xl px-7 py-8 md:flex md:items-center md:gap-12">
            <div className="mb-5 md:mb-0">
              <Shield className="w-10 h-10 text-[#00E676]" />
            </div>
            <div className="flex-1">
              <h3
                className="text-xl md:text-2xl font-black text-white mb-2"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                AVG-compliant voor kinderen
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                JeugdTocht en VoetbalMissie zijn gebouwd met extra privacy: geen PII opgeslagen,
                foto&apos;s verwijderd na 30 dagen, geofencing met alarm, geen chat (alleen hint-knoppen).
              </p>
            </div>
            <div className="mt-5 md:mt-0 shrink-0">
              <Link
                href="/jeugdtocht"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#00E676] border border-[#00E676]/30 px-4 py-2.5 rounded-xl hover:bg-[#00E676]/10 transition-colors"
              >
                Meer over kids-veiligheid <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-8">Wat deelnemers zeggen</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initials }) => (
              <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Quote className="w-6 h-6 text-[#00E676] mb-4" />
                <p
                  className="text-white text-base md:text-lg font-medium leading-relaxed mb-6"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00E676]/15 border border-[#00E676]/20 flex items-center justify-center">
                    <span className="text-[#00E676] text-xs font-black">{initials}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{name}</p>
                    <p className="text-[#64748B] text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
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
            Klaar om de buurt<br />te verkennen?
          </h2>
          <p className="text-[#0F172A]/60 text-sm md:text-base mb-7 max-w-sm mx-auto">
            Kies jouw variant, boek een datum en wij zorgen voor de rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/tochten"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Boek een tocht
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Doe mee als team ↗
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-[#0F172A]/50 text-xs">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Alle varianten</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AVG-compliant</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Persoonlijk rapport</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-white rounded-lg px-2 py-1 inline-flex">
                  <Image src="/images/IctusGo.png" alt="IctusGo" width={100} height={30} className="h-6 w-auto" />
                </div>
              </div>
              <p className="text-[#64748B] text-xs max-w-xs leading-relaxed">
                GPS-gestuurd teambuilding met echte sociale impact.
                Voor bedrijven, scholen en gezinnen — onderdeel van TeambuildingMetImpact.nl.
              </p>
            </div>

            {/* Links — desktop */}
            <div className="hidden md:grid grid-cols-3 gap-12 text-xs">
              <div>
                <p className="text-white font-bold mb-3">Varianten</p>
                <div className="space-y-2 text-[#64748B]">
                  <p>WijkTocht</p>
                  <p>ImpactSprint</p>
                  <p>FamilieTocht</p>
                  <p>JeugdTocht</p>
                  <Link href="/voetbalmissie" className="block hover:text-white transition-colors">VoetbalMissie</Link>
                </div>
              </div>
              <div>
                <p className="text-white font-bold mb-3">Platform</p>
                <div className="space-y-2 text-[#64748B]">
                  <p>GMS Score</p>
                  <p>Impact rapport</p>
                  <p>Live scorebord</p>
                </div>
              </div>
              <div>
                <p className="text-white font-bold mb-3">Bedrijf</p>
                <div className="space-y-2 text-[#64748B]">
                  <p>Over ons</p>
                  <p>Contact</p>
                  <p>FAQ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row md:justify-between gap-2 text-xs text-[#475569]">
            <p>© {new Date().getFullYear()} IctusGo — onderdeel van TeambuildingMetImpact.nl</p>
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
