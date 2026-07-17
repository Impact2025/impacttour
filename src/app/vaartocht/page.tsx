import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  ArrowRight,
  CheckCircle2,
  Quote,
  Anchor,
  Compass,
  LifeBuoy,
  MapPin,
  Waves,
  Camera,
  Sailboat,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'VaarTocht — GPS-teambuilding per sloep over de Kaag',
  description:
    'Sloeptocht met GPS-checkpoints over de Kagerplassen: start bij Jachthaven Jonkman in Sassenheim, langs eeuwenoude molens, Kaageiland en Koudenhoorn. Max. 4 uur varen, geen vaarbewijs nodig, €12,50 p.p.',
  alternates: { canonical: '/vaartocht' },
  openGraph: {
    title: 'VaarTocht — GPS-teambuilding per sloep over de Kaag',
    description:
      'Vaar met je team langs molens, eilanden en dorpsgezichten. GPS ontgrendelt de checkpoints, jullie voltooien de missies — op het water en aan land.',
    url: '/vaartocht',
  },
}

const CHECKPOINTS = [
  {
    nr: '01',
    title: 'Loskomen van de wal',
    desc: 'Jachthaven Jonkman, Sassenheim. Rolverdeling aan boord en de teamdoop van jullie sloep.',
    type: 'kennismaking',
    color: '#0EA5E9',
  },
  {
    nr: '02',
    title: 'Molen De Kager (1683)',
    desc: 'De wipmolen die het eiland ruim drie eeuwen droog hield. Quiz over de motor van de polder.',
    type: 'kennisquiz',
    color: '#8B5CF6',
  },
  {
    nr: '03',
    title: 'Kaageiland',
    desc: 'Aanleggen bij het enige echte eilanddorp van de plassen. Vind het verhaal van de eilanders.',
    type: 'foto-opdracht · aan land',
    color: '#EC4899',
  },
  {
    nr: '04',
    title: 'Zwanburgermolen (1805)',
    desc: 'Een molen op een eiland dat je alleen over water bereikt. Wat vroeg dat leven — en wat gaf het?',
    type: 'teamopdracht',
    color: '#F59E0B',
  },
  {
    nr: '05',
    title: 'Koudenhoorn & Warmond',
    desc: 'Het zwemeiland van Warmond als filmset: maak de trailer van jullie Kaag-avontuur.',
    type: 'video-challenge',
    color: '#00E676',
  },
  {
    nr: '06',
    title: "Stilte op 't Joppe",
    desc: 'Motor uit. Drie minuten alleen water, wind en riet — en dan één eerlijke vraag.',
    type: 'reflectie',
    color: '#3B82F6',
  },
  {
    nr: '07',
    title: 'Thuishaven',
    desc: 'Perfect aanleggen als bemanning en dé teamfoto van de dag op de steiger.',
    type: 'finale',
    color: '#0EA5E9',
  },
]

const FEATURES = [
  {
    icon: Compass,
    title: 'GPS wijst de koers',
    desc: 'De kaart op jullie telefoon toont het volgende checkpoint. Kom je in de zone, dan ontgrendelt de missie vanzelf — met ruime zones, want op het water lig je nooit exact op een punt.',
  },
  {
    icon: Waves,
    title: 'Missies op het water én aan land',
    desc: 'Quizzen langs molens, aanleggen op Kaageiland, een video-challenge bij het zwemeiland en een stiltemoment met de motor uit. AI beoordeelt jullie antwoorden en scoort op verbinding, betekenis, plezier en groei.',
  },
  {
    icon: Anchor,
    title: 'Geen vaarbewijs nodig',
    desc: 'Sloepen huur je bij Jachthaven Jonkman (v.a. 25 jaar, met instructie bij vertrek). Eigen boot meenemen kan natuurlijk ook.',
  },
  {
    icon: LifeBuoy,
    title: 'Veiligheid eerst',
    desc: 'Zwemvesten aan boord, de schipper drinkt niet, rustig vaartempo — de tocht is zo opgezet dat geen enkele missie haast op het water vraagt.',
  },
]

export default function VaartochtPage() {
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
              href="/tochten?variant=vaartocht"
              className="text-xs font-bold bg-[#0EA5E9] text-white px-4 py-2 rounded-xl hover:bg-[#0284C7] transition-colors"
            >
              Boek VaarTocht
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:gap-16">
          <div className="flex-1 mb-10 md:mb-0">
            <span className="inline-block text-[10px] font-bold text-[#38BDF8] bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
              ⛵ VaarTocht · de Kaag
            </span>

            <h1
              className="text-[2.6rem] md:text-6xl font-black italic text-white leading-[1.05] mb-4"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Jullie sloep is vandaag<br />
              <span className="text-[#38BDF8]">de teamkamer.</span>
            </h1>

            <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed mb-6 max-w-md">
              GPS-teambuilding op de Kagerplassen. Vaar in maximaal 4 uur langs
              eeuwenoude molens, het autovrije Kaageiland en de stilte van het
              open water — checkpoint voor checkpoint, missie voor missie.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Link
                href="/tochten?variant=vaartocht"
                className="inline-flex items-center justify-center gap-2 bg-[#0EA5E9] text-white font-bold text-sm px-6 py-3.5 rounded-2xl hover:bg-[#0284C7] transition-colors"
              >
                Boek voor jouw groep
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
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#38BDF8]" /> 7 checkpoints</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#38BDF8]" /> Max. 4 uur varen</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#38BDF8]" /> €12,50 p.p.</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#38BDF8]" /> Geen vaarbewijs nodig</span>
            </div>
          </div>

          {/* Stats grid — desktop */}
          <div className="hidden md:grid grid-cols-2 gap-3 w-80">
            {[
              { value: '~12,5 km', label: 'vaarroute over de plassen' },
              { value: '2 molens', label: 'De Kager (1683) & Zwanburger (1805)' },
              { value: '1 eiland', label: 'aanleggen op het autovrije Kaageiland' },
              { value: '3 min', label: 'stilte met de motor uit' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p
                  className="text-2xl font-black italic text-[#38BDF8]"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {s.value}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Route / checkpoints ────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-[10px] font-bold text-[#0EA5E9] bg-[#0EA5E9]/10 rounded-full px-3 py-1 mb-3 uppercase tracking-widest">
              De route
            </span>
            <h2
              className="text-3xl md:text-4xl font-black italic text-[#0F172A]"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Rondje Kaag in 7 checkpoints
            </h2>
            <p className="text-[#64748B] text-sm mt-2 max-w-xl mx-auto">
              Start en finish bij Jachthaven Jonkman in Sassenheim. GPS ontgrendelt elk
              checkpoint zodra jullie sloep de zone binnenvaart.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHECKPOINTS.map((cp) => (
              <div key={cp.nr} className="rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-2xl font-black italic"
                    style={{ color: cp.color, fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {cp.nr}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: cp.color, backgroundColor: `${cp.color}15` }}
                  >
                    {cp.type}
                  </span>
                </div>
                <p className="font-bold text-[#0F172A] mb-1">{cp.title}</p>
                <p className="text-sm text-[#64748B] leading-relaxed">{cp.desc}</p>
              </div>
            ))}

            {/* Praktisch-kaart als 8e tegel */}
            <div className="rounded-2xl bg-[#0F172A] p-5 flex flex-col justify-between">
              <div>
                <MapPin className="w-5 h-5 text-[#38BDF8] mb-3" />
                <p className="font-bold text-white mb-1">Startlocatie</p>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Jachthaven Jonkman<br />
                  Jachthaven 1, 2172 JX Sassenheim<br />
                  Sloepverhuur ter plekke · gratis parkeren
                </p>
              </div>
              <Link
                href="/tochten?variant=vaartocht"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#38BDF8] hover:text-white transition-colors"
              >
                Bekijk beschikbaarheid <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl font-black italic text-[#0F172A]"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Zo werkt teambuilding op het water
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#0EA5E9]" />
                </div>
                <p className="font-bold text-[#0F172A] mb-1.5">{title}</p>
                <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voor wie ───────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Voor teams, families én vriendengroepen
          </h2>
          <p className="text-[#64748B] text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            Eén sloep is één team van 4-8 personen. Met meerdere sloepen vaart iedereen
            dezelfde route en strijden jullie op het live scorebord — perfect als
            bedrijfsuitje, familiedag of vrijgezellenalternatief met inhoud. Na afloop
            krijgt elke groep een persoonlijk Coach Inzicht en een deelbaar rapport.
          </p>
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-6 max-w-2xl mx-auto text-left">
            <Quote className="w-5 h-5 text-[#0EA5E9] mb-3" />
            <p className="text-sm text-[#0F172A] leading-relaxed italic mb-3">
              &ldquo;Drie minuten met de motor uit op &rsquo;t Joppe — niemand zei iets, en
              tóch was dat het moment waar we het bij de borrel nog over hadden.&rdquo;
            </p>
            <p className="text-xs text-[#64748B]">— Pilotgroep VaarTocht, Kagerplassen</p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Sailboat className="w-8 h-8 text-[#38BDF8] mx-auto mb-4" />
          <h2
            className="text-3xl md:text-5xl font-black italic text-white mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Gooi de trossen los.
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base mb-8 max-w-xl mx-auto">
            Kies een datum, huur de sloepen bij Jachthaven Jonkman en wij zorgen voor
            de rest: route, missies, AI-begeleiding en het scorebord.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tochten?variant=vaartocht"
              className="inline-flex items-center justify-center gap-2 bg-[#0EA5E9] text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-[#0284C7] transition-colors"
            >
              Boek de VaarTocht <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#94A3B8] font-medium text-sm px-8 py-4 rounded-2xl hover:bg-white/5 transition-colors"
            >
              Vragen? Neem contact op
            </Link>
          </div>
          <p className="text-[11px] text-[#475569] mt-6 flex items-center justify-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Foto&rsquo;s en video&rsquo;s blijven van jullie — wij bewaren ze maximaal 30 dagen.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E2E8F0] px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-[#94A3B8]">
          <p>© {new Date().getFullYear()} IctusGo — GPS-teambuilding met impact</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-[#0F172A] transition-colors">Alle varianten</Link>
            <Link href="/prijzen" className="hover:text-[#0F172A] transition-colors">Prijzen</Link>
            <Link href="/privacy" className="hover:text-[#0F172A] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
