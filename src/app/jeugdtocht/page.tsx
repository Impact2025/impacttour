import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Quote, Shield, MapPin, MessageCircle, Navigation } from 'lucide-react'

export const metadata = {
  title: 'JeugdTocht — GPS-avontuur voor 9-13 jaar | IctusGo',
  description: 'GPS-missies speciaal voor kinderen van 9 tot 13 jaar. Veilig, actief en vol echte ontdekkingen in de buurt.',
}

const CHECKPOINTS = [
  {
    nr: '01',
    title: 'Buurt verkennen',
    desc: 'Teams ontdekken hun directe omgeving via GPS-navigatie en beantwoorden vragen over wat ze zien.',
    type: 'verkenning',
    color: '#3B82F6',
  },
  {
    nr: '02',
    title: 'Interview opdracht',
    desc: 'Kinderen voeren een kort interview met een buurtbewoner of passant. Ze leren luisteren en verbinding maken.',
    type: 'sociale opdracht',
    color: '#EC4899',
  },
  {
    nr: '03',
    title: 'Creatieve uitdaging',
    desc: 'Een tekening maken, een verhaal bedenken of een foto schieten die een gevoel uitdrukt. Eigen invulling!',
    type: 'creatief',
    color: '#8B5CF6',
  },
  {
    nr: '04',
    title: 'Team challenge',
    desc: 'Een gezamenlijke opdracht waarbij elk teamlid een rol heeft. Samenwerking bepaalt het resultaat.',
    type: 'teamwerk',
    color: '#F59E0B',
  },
  {
    nr: '05',
    title: 'Impact Finale',
    desc: 'Wat hebben jullie vandaag geleerd? Kinderen reflecteren samen op hun avontuur en de impact die ze maakten.',
    type: 'debriefing',
    color: '#00E676',
  },
]

const PRIVACY_ITEMS = [
  {
    icon: '🔒',
    title: 'Geen persoonsgegevens',
    desc: 'We slaan geen naam, e-mail of andere persoonlijke gegevens van kinderen op. Alleen een anoniem teamtoken.',
  },
  {
    icon: '📍',
    title: 'Geofencing beveiliging',
    desc: 'Spelleider stelt een veilige zone in. Bij grensoverschrijding volgt direct een alarm op de spelleider-app.',
  },
  {
    icon: '💬',
    title: 'Geen open chat',
    desc: 'Kinderen kunnen niet vrij typen. Flits-assistent werkt alleen via hint-knoppen — veilig en overzichtelijk.',
  },
  {
    icon: '🗑️',
    title: "Foto's weg na 30 dagen",
    desc: "Geüploade foto's worden automatisch verwijderd na 30 dagen. Volledig AVG-compliant.",
  },
]

export default function JeugdtochtPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden md:block text-sm font-medium text-[#64748B] hover:text-[#0F172A] px-3 py-1.5 transition-colors"
            >
              Alle varianten
            </Link>
            <Link
              href="/tochten"
              className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors"
            >
              Boek JeugdTocht
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:gap-16">
          <div className="flex-1 mb-10 md:mb-0">
            <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
              🛡️ JeugdTocht · 9-13 jaar
            </span>

            <h1
              className="text-[2.6rem] md:text-6xl font-black italic text-white leading-[1.05] mb-4"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Het grote avontuur<br />
              <span className="text-[#00E676]">begint om de hoek.</span>
            </h1>

            <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed mb-6 max-w-md">
              GPS-missies speciaal voor kinderen van 9 tot 13 jaar. Veilig, actief en vol
              echte ontdekkingen in hun eigen buurt.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Link
                href="/tochten"
                className="inline-flex items-center justify-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-6 py-3.5 rounded-2xl hover:bg-[#00C853] transition-colors"
              >
                Boek JeugdTocht
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/join"
                className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-6 py-3.5 rounded-2xl hover:bg-white/5 transition-colors"
              >
                Doe mee als team
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#00E676]" /> 5 checkpoints</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#00E676]" /> 90 minuten</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#00E676]" /> 9-13 jaar</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#00E676]" /> AVG-veilig</span>
            </div>
          </div>

          {/* Stats grid — desktop */}
          <div className="grid grid-cols-2 gap-3 md:w-[320px] shrink-0">
            {[
              { label: 'Checkpoints', value: '5', sub: 'GPS-missies' },
              { label: 'Duur', value: '90 min', sub: 'inclusief debriefing' },
              { label: 'Leeftijd', value: '9-13', sub: 'jaar' },
              { label: 'Max GMS', value: '100', sub: 'per checkpoint' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div
                  className="text-2xl font-black text-white mb-0.5"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {value}
                </div>
                <div className="text-[#94A3B8] text-[10px]">{sub}</div>
                <div className="text-[#64748B] text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Checkpoints ────────────────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">De route</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            5 echte ontdekkingen.
          </h2>

          <div className="space-y-4">
            {CHECKPOINTS.map(({ nr, title, desc, type, color }) => (
              <div
                key={nr}
                className="flex gap-4 md:gap-6 bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#00E676]/30 transition-colors"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {nr}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-1">
                    <h3 className="font-bold text-[#0F172A] text-sm">{title}</h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest shrink-0"
                      style={{ color }}
                    >
                      {type}
                    </span>
                  </div>
                  <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Ingebouwde functies</p>
          <h2
            className="text-2xl md:text-4xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Veilig en leuk tegelijk.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                Icon: Navigation,
                iconColor: '#3B82F6',
                iconBg: '#3B82F615',
                title: 'GPS Navigatie',
                desc: 'Kinderen navigeren zelfstandig naar checkpoints via real-time GPS. Leuk en educatief.',
              },
              {
                Icon: MessageCircle,
                iconColor: '#8B5CF6',
                iconBg: '#8B5CF615',
                title: 'Flits-assistent',
                desc: 'Kids-vriendelijke AI-assistent. Geen open chat — alleen hint-knoppen. Veilig en helder.',
              },
              {
                Icon: Shield,
                iconColor: '#00E676',
                iconBg: '#00E67615',
                title: 'Geofencing',
                desc: 'Spelleider stelt een veilige zone in. Bij grensoverschrijding volgt direct een alarm.',
              },
              {
                Icon: MapPin,
                iconColor: '#F59E0B',
                iconBg: '#F59E0B15',
                title: 'GMS Geluksscore',
                desc: 'Elk checkpoint levert Geluksmomenten Punten op in 4 dimensies: verbinding, groei, plezier en betekenis.',
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

      {/* ── Kids Safety ────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-4 uppercase tracking-widest">
              Veiligheid
            </span>
            <h2
              className="text-2xl md:text-4xl font-black text-white mb-3"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Privacy by Design<br />voor kinderen.
            </h2>
            <p className="text-[#94A3B8] text-sm max-w-xl leading-relaxed">
              JeugdTocht is gebouwd met de veiligheid van kinderen als eerste prioriteit.
              Volledig AVG-compliant voor scholen, buurtcentra en jeugdorganisaties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRIVACY_ITEMS.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ────────────────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <Quote className="w-8 h-8 text-[#00E676] mb-5" />
            <p
              className="text-[#0F172A] text-xl md:text-2xl font-medium leading-relaxed mb-7"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              &ldquo;De kinderen waren enorm enthousiast. Ze liepen zelfstandig door de buurt,
              maakten nieuwe contacten en kwamen terug met verhalen die ze thuis nog weken
              navertelden. Dit is echte maatschappelijke vorming.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00E676]/15 border border-[#00E676]/20 flex items-center justify-center">
                <span className="text-[#00E676] text-xs font-black">SB</span>
              </div>
              <div>
                <p className="text-[#0F172A] text-sm font-bold">Sandra Bakker</p>
                <p className="text-[#64748B] text-xs uppercase tracking-wide">Groepsleerkracht · OBS De Wegwijzer · Amsterdam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy callout ────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl px-7 py-8 border border-[#E2E8F0] md:flex md:items-center md:gap-12">
            <div className="mb-5 md:mb-0 text-3xl">🏫</div>
            <div className="flex-1">
              <h3
                className="text-xl md:text-2xl font-black text-[#0F172A] mb-2"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Geschikt voor scholen en jeugdorganisaties
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                JeugdTocht is goedgekeurd voor gebruik op schooltijd en buitenschoolse activiteiten.
                Volledig AVG-compliant, geen oudertoestemming voor data nodig.
                Vraag een offerte aan via info@teambuildingmetimpact.nl.
              </p>
            </div>
            <div className="mt-5 md:mt-0 shrink-0">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#00E676] border border-[#00E676]/30 px-4 py-2.5 rounded-xl hover:bg-[#00E676]/10 transition-colors"
              >
                Privacybeleid lezen <ArrowRight className="w-3 h-3" />
              </Link>
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
            Klaar voor<br />het grote avontuur?
          </h2>
          <p className="text-[#0F172A]/60 text-sm md:text-base mb-7 max-w-sm mx-auto">
            Boek JeugdTocht voor jouw klas, jeugdgroep of buurtvereniging.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/tochten"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Boek JeugdTocht →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Andere varianten ↗
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-[#0F172A]/50 text-xs">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Geofencing</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AVG-compliant</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Impactrapport</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-4 text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex">
              <Image src="/images/IctusGo.png" alt="IctusGo" width={80} height={24} className="h-5 w-auto" />
            </div>
            <span className="text-[#475569]">— onderdeel van TeambuildingMetImpact.nl</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Alle varianten</Link>
            <Link href="/voetbalmissie" className="hover:text-white transition-colors">VoetbalMissie</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
