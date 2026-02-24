'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Smartphone,
  Users,
  Hammer,
  Eye,
  BarChart2,
  Share2,
  Network,
  Target,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'

const STEPS = [
  {
    nr: '01',
    icon: ClipboardList,
    title: 'Jij meldt je aan',
    desc: 'Vertel ons wie jullie zijn, wat je aanbiedt en welk soort hulp je kunt gebruiken. Aanmelden duurt vijf minuten.',
  },
  {
    nr: '02',
    icon: MessageSquare,
    title: 'Wij nemen contact op',
    desc: 'We plannen een kennismakingsgesprek om jouw verhaal te leren kennen en de samenwerking goed in te richten.',
  },
  {
    nr: '03',
    icon: Smartphone,
    title: 'Jij staat in de app',
    desc: 'Je organisatie wordt zichtbaar als locatie in de ICTUSGO-app. Bedrijfsteams kunnen jou selecteren voor hun teamdag.',
  },
  {
    nr: '04',
    icon: Users,
    title: 'Teams komen langs',
    desc: 'Een groep enthousiaste professionals werkt een dagdeel bij of mét jou. Na afloop ontvang je een impact-rapport.',
  },
]

const BENEFITS = [
  {
    icon: Hammer,
    title: 'Gratis vrijwilligers op de vloer',
    desc: 'Elk bedrijfsteam dat jou bezoekt, brengt enthousiaste mensen mee die een dagdeel écht aan de slag gaan. Klussen, bouwen, ondersteunen, verbinden — afgestemd op wat jij nodig hebt.',
    highlight: true,
  },
  {
    icon: Eye,
    title: 'Zichtbaarheid bij bedrijven',
    desc: 'Je organisatie wordt gepresenteerd in de ICTUSGO-app én op onze website, bij honderden HR-managers, teamleiders en directeuren die op zoek zijn naar een locatie met betekenis.',
    highlight: false,
  },
  {
    icon: BarChart2,
    title: 'Meetbaar impact-rapport',
    desc: 'Na elke teamdag ontvang je een overzicht van wat het bezoek heeft opgeleverd: gewerkte uren, uitgevoerde activiteiten en de Geluksmomenten Score van het team.',
    highlight: false,
  },
  {
    icon: Share2,
    title: 'Verhalen die blijven hangen',
    desc: 'Teams die bij jou op bezoek komen, nemen jouw verhaal mee terug naar hun organisatie. Dat levert mond-tot-mondreclame op die geen advertentiebudget kan kopen.',
    highlight: false,
  },
  {
    icon: Network,
    title: 'Netwerk van gelijkgestemden',
    desc: 'Als locatiepartner word je onderdeel van het ICTUSGO-netwerk van sociale ondernemingen, zorginstellingen en maatschappelijke initiatieven die samen impact maken met bedrijven.',
    highlight: false,
  },
  {
    icon: Target,
    title: 'Bijdrage aan je missie',
    desc: 'Elk team dat langskomt draagt direct bij aan jouw organisatiedoelen. Of dat nu extra handen zijn, donaties van bedrijven of gewoon aandacht: het telt mee.',
    highlight: false,
  },
]

const TAGS = [
  'Sociale ondernemingen',
  'Zorginstellingen',
  'Buurtinitiatieven',
  'Stichtingen & goede doelen',
  'Gemeenten & overheden',
  'Welzijnsorganisaties',
  'Groene initiatieven',
  'Maatschappelijke ondernemers',
]

const INCLUDED = [
  'Profiel in de ICTUSGO-app',
  'Zichtbaarheid op onze website',
  'Teams die bij je langskomen',
  'Impact-rapport na elk bezoek',
  'Persoonlijke begeleiding',
  'Netwerk van locatiepartners',
]

const ORG_TYPES = [
  'Sociale onderneming',
  'Zorginstelling',
  'Stichting & goed doel',
  'Gemeente & overheid',
  'Welzijnsorganisatie',
  'Anders',
]

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function OrganisatiesPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState({
    organisatieNaam: '',
    type: '',
    naam: '',
    email: '',
    plaats: '',
    verhaal: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    try {
      const res = await fetch('/api/organisaties/aanmelden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/40 focus:border-[#00E676] transition-all placeholder:text-[#94A3B8]'

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <Link
            href="#aanmelden"
            className="px-4 py-2 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors"
          >
            Aanmelden als locatie
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-5">
              Locatiepartner worden
            </p>
            <h1
              className="text-5xl md:text-7xl font-black text-[#0F172A] leading-[0.95] mb-6"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Zet jouw organisatie<br />
              <span className="text-[#00E676]">op de kaart</span>
            </h1>
            <p className="text-[#64748B] text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              ICTUSGO brengt bedrijfsteams naar locaties met een verhaal. Gratis. Met echte hulp, zichtbaarheid en meetbare impact voor jouw organisatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <Link
                href="#aanmelden"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#00E676] text-[#0F172A] font-bold rounded-xl hover:bg-[#00C853] transition-colors text-sm"
              >
                Meld je gratis aan
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#voordelen"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#E2E8F0] text-[#0F172A] font-semibold rounded-xl hover:border-[#0F172A] transition-colors text-sm"
              >
                Bekijk de voordelen
                <ChevronDown className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-10 inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-4 py-2">
            <div className="flex -space-x-1.5">
              {['#00E676', '#3B82F6', '#EC4899', '#F59E0B'].map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-[#0F172A] text-xs font-semibold">Al 20+ organisaties gingen je voor</span>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ───────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Zo werkt het</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-12 max-w-lg"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Van aanmelding tot impact in vier stappen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ nr, icon: Icon, title, desc }) => (
              <div key={nr} className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[#00E676] font-black text-sm"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {nr}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#00C853]" strokeWidth={1.75} />
                  </div>
                </div>
                <h3 className="font-bold text-[#0F172A] text-sm mb-2">{title}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voordelen ───────────────────────────────────────────────────── */}
      <section id="voordelen" className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Wat je ervoor terugkrijgt</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-3 max-w-lg"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Vijf echte voordelen voor jouw organisatie
          </h2>
          <p className="text-[#64748B] text-sm md:text-base mb-10 max-w-xl">
            Jij biedt een plek met een verhaal. Wij zorgen dat dat verhaal gehoord wordt — en dat er handen bijkomen.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ icon: Icon, title, desc, highlight }) => (
              <div
                key={title}
                className={`rounded-2xl p-6 ${highlight
                  ? 'bg-[#0F172A] border border-white/10'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${highlight ? 'bg-[#00E676]/15' : 'bg-white border border-[#E2E8F0]'}`}>
                  <Icon className={`w-5 h-5 ${highlight ? 'text-[#00E676]' : 'text-[#0F172A]'}`} strokeWidth={1.75} />
                </div>
                <h3 className={`font-bold text-sm mb-2 ${highlight ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h3>
                <p className={`text-xs leading-relaxed ${highlight ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voor wie ────────────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Geschikt voor</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-3 max-w-lg"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Is jouw organisatie een goede match?
          </h2>
          <p className="text-[#64748B] text-sm md:text-base mb-8 max-w-xl">
            ICTUSGO werkt het beste met organisaties die een verhaal hebben: een plek, een missie of een gemeenschap die bedrijfsteams raakt én inspireert.
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {TAGS.map(tag => (
              <span
                key={tag}
                className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-full text-sm text-[#0F172A] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-[#64748B] text-sm max-w-lg leading-relaxed bg-white border border-[#E2E8F0] rounded-xl p-4">
            Twijfel je of jouw organisatie past? Meld je gewoon aan. We bespreken het samen tijdens het kennismakingsgesprek. Er zijn geen verplichtingen.
          </p>
        </div>
      </section>

      {/* ── Kosten ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-20">

            <div className="flex-1 mb-10 lg:mb-0">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Transparantie</p>
              <h2
                className="text-3xl md:text-5xl font-black text-white leading-tight mb-5"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Wat kost het jou?
              </h2>
              <p className="text-[#94A3B8] text-sm mb-5 font-semibold">Niets. Deelname als locatiepartner is volledig gratis.</p>
              <p className="text-[#64748B] text-sm leading-relaxed mb-4 max-w-md">
                Wij geloven dat organisaties als die van jou al genoeg doen voor de samenleving. Jullie bieden iets onbetaalbaars: een plek met betekenis, een verhaal dat inspireert en een doel dat telt. Dat verdient ondersteuning, geen rekening.
              </p>
              <p className="text-[#64748B] text-sm leading-relaxed max-w-md">
                ICTUSGO verdient zijn geld aan de bedrijven die onze app gebruiken voor hun teamdagen. Jij profiteert mee van die samenwerking, zonder ook maar één euro neer te leggen.
              </p>
            </div>

            <div className="lg:w-[360px] shrink-0">
              <div className="bg-white rounded-2xl p-7">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Kosten voor locatiepartners</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-6xl font-black text-[#0F172A]"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    €0
                  </span>
                </div>
                <p className="text-[#64748B] text-xs mb-6">altijd, voor altijd</p>

                <div className="space-y-3 mb-6">
                  {INCLUDED.map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
                      <span className="text-sm text-[#0F172A]">{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="#aanmelden"
                  className="block w-full py-3.5 bg-[#00E676] text-[#0F172A] font-bold text-sm text-center rounded-xl hover:bg-[#00C853] transition-colors"
                >
                  Meld je gratis aan
                </Link>

                <p className="text-[#94A3B8] text-[10px] leading-relaxed mt-4 text-center">
                  In de toekomst introduceren we een optioneel Premium-profiel voor organisaties die nog meer zichtbaarheid willen. Altijd jouw keuze.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Aanmeldformulier ────────────────────────────────────────────── */}
      <section id="aanmelden" className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Gratis aanmelden</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Klaar om mee te doen?
          </h2>
          <p className="text-[#64748B] text-sm mb-10">
            Vul het formulier in. We nemen binnen twee werkdagen contact met je op voor een vrijblijvend kennismakingsgesprek.
          </p>

          {formState === 'success' ? (
            <div className="bg-[#F0FDF4] border border-[#00E676]/30 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 bg-[#00E676]/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-[#00C853]" />
              </div>
              <h3 className="font-bold text-[#0F172A] text-lg mb-2">Aanmelding ontvangen</h3>
              <p className="text-[#64748B] text-sm">
                Bedankt voor je aanmelding. We nemen binnen twee werkdagen contact met je op voor een kennismakingsgesprek.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Naam organisatie</label>
                  <input
                    type="text"
                    required
                    placeholder="Stichting De Buurt"
                    className={inputCls}
                    value={form.organisatieNaam}
                    onChange={e => setForm(f => ({ ...f, organisatieNaam: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Type organisatie</label>
                  <div className="relative">
                    <select
                      required
                      className={`${inputCls} appearance-none pr-10`}
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    >
                      <option value="" disabled>Selecteer type</option>
                      {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Jouw naam</label>
                  <input
                    type="text"
                    required
                    placeholder="Jan de Vries"
                    className={inputCls}
                    value={form.naam}
                    onChange={e => setForm(f => ({ ...f, naam: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">E-mailadres</label>
                  <input
                    type="email"
                    required
                    placeholder="jan@organisatie.nl"
                    className={inputCls}
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Plaats / gemeente</label>
                <input
                  type="text"
                  required
                  placeholder="Utrecht"
                  className={inputCls}
                  value={form.plaats}
                  onChange={e => setForm(f => ({ ...f, plaats: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Jullie verhaal in één zin</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Wij bieden dagbesteding aan mensen met een afstand tot de arbeidsmarkt en zoeken handen om onze moestuin mee te onderhouden."
                  className={`${inputCls} resize-none`}
                  value={form.verhaal}
                  onChange={e => setForm(f => ({ ...f, verhaal: e.target.value }))}
                />
              </div>

              {formState === 'error' && (
                <p className="text-[#EF4444] text-xs">Er ging iets mis. Probeer het opnieuw of mail naar info@teambuildingmetimpact.nl.</p>
              )}

              <button
                type="submit"
                disabled={formState === 'loading'}
                className="w-full py-4 bg-[#00E676] text-[#0F172A] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#00C853] transition-colors disabled:opacity-60 text-sm"
              >
                {formState === 'loading' ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
                ) : (
                  <>Aanmelden als locatiepartner <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[#94A3B8] text-[11px] text-center leading-relaxed">
                Geen verplichtingen. Geen kosten. We bespreken alles eerst in een persoonlijk gesprek.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer mini ─────────────────────────────────────────────────── */}
      <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 border border-[#E2E8F0] inline-flex">
              <Image src="/images/IctusGo.png" alt="IctusGo" width={80} height={24} className="h-5 w-auto" />
            </div>
            <span>onderdeel van TeambuildingMetImpact.nl</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-[#0F172A] transition-colors">Terug naar home</Link>
            <a href="mailto:info@teambuildingmetimpact.nl" className="hover:text-[#0F172A] transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
