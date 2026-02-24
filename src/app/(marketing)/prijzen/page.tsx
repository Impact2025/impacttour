'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, MapPin, Heart, Shield, Target } from 'lucide-react'

const VARIANTS = [
  {
    icon: MapPin,
    slug: 'wijktocht',
    name: 'WijkTocht',
    target: 'Bedrijven & teams',
    pricePerPerson: 12,
    priceFixed: 180,
    minPersons: 10,
    popular: false,
    color: '#3B82F6',
    bg: '#3B82F615',
    features: [
      'GPS-navigatie op eigen telefoon',
      'Onbeperkt checkpoints (8 standaard)',
      'AI Scout-begeleiding',
      'Live scorebord voor spelleider',
      'Persoonlijk Coach Inzicht per team',
      'PDF impactrapport',
    ],
    cta: 'Boek WijkTocht',
  },
  {
    icon: Zap,
    slug: 'impactsprint',
    name: 'ImpactSprint',
    target: 'Compact · 90 min',
    pricePerPerson: 9,
    priceFixed: 120,
    minPersons: 10,
    popular: true,
    color: '#8B5CF6',
    bg: '#8B5CF615',
    badge: 'Meest populair',
    features: [
      '5 checkpoints · 500m radius',
      'Maximale impact in 90 minuten',
      'AI Scout-begeleiding',
      'Live scorebord',
      'Coach Inzicht per team',
      'Geschikt voor drukke agenda\'s',
    ],
    cta: 'Boek ImpactSprint',
  },
  {
    icon: Heart,
    slug: 'familietocht',
    name: 'FamilieTocht',
    target: 'Gezinnen · weekend',
    pricePerPerson: 8,
    priceFixed: 0,
    minPersons: 1,
    popular: false,
    color: '#EC4899',
    bg: '#EC489915',
    badge: 'Per gezin',
    features: [
      'GPS-avontuur voor ouders + kinderen',
      'Familie Geluksscore',
      'AI Buddy-begeleiding (gezinsvriendelijk)',
      'Foto-opdrachten',
      'Deelbaar familierapport',
      'Weekenden en vakanties',
    ],
    cta: 'Boek FamilieTocht',
  },
  {
    icon: Shield,
    slug: 'jeugdtocht',
    name: 'JeugdTocht',
    target: 'Kinderen 9-13 jaar',
    pricePerPerson: 6,
    priceFixed: 90,
    minPersons: 15,
    popular: false,
    color: '#F59E0B',
    bg: '#F59E0B15',
    features: [
      'AVG-compliant (geen PII)',
      'Geofencing met alarmsysteem',
      'Flits AI-assistent (hints only)',
      'Geen chat — veilig voor kids',
      'Foto\'s verwijderd na 30 dagen',
      'Spelleider dashboard',
    ],
    cta: 'Boek JeugdTocht',
  },
  {
    icon: Target,
    slug: 'voetbalmissie',
    name: 'VoetbalMissie',
    target: 'Voetbalclubs · scholen',
    pricePerPerson: 6,
    priceFixed: 65,
    minPersons: 10,
    popular: false,
    color: '#00E676',
    bg: '#00E67615',
    badge: '€6/kind schooltarief',
    features: [
      '5 sociale checkpoints rondom het veld',
      'Verborgen empathielessen in voetbaltaal',
      'Geofencing + kids-veiligheid',
      'Countdown-timer opdrachten',
      'Bonus fotopunten',
      'Trainer/coach dashboard',
    ],
    cta: 'Boek VoetbalMissie',
  },
]

const FAQ = [
  {
    q: 'Is de prijs inclusief BTW?',
    a: 'Alle getoonde prijzen zijn exclusief 21% BTW. Na betaling ontvang je een factuur met BTW-specificatie.',
  },
  {
    q: 'Kan ik een tocht annuleren of verzetten?',
    a: 'Tot 48 uur voor aanvang kun je kosteloos annuleren of verzetten. Daarna geldt 50% van de totaalprijs.',
  },
  {
    q: 'Hoe werkt de betaling?',
    a: 'We werken met MultiSafepay — je kunt betalen via iDEAL, creditcard, of bankoverschrijving op factuur (voor organisaties).',
  },
  {
    q: 'Is er een korting voor scholen of non-profits?',
    a: 'Ja! Scholen, gemeenten en non-profit organisaties krijgen 20% korting. Neem contact op voor een offerte.',
  },
  {
    q: 'Wat als er technische problemen zijn tijdens de tocht?',
    a: 'We bieden live support via WhatsApp tijdens kantooruren én een testmodus zodat je alles van tevoren kunt controleren.',
  },
  {
    q: 'Kan ik een maatwerktocht laten maken?',
    a: 'Absoluut. We bouwen tochten op maat voor jouw locatie, thema en branding. Vraag een offerte aan via contact.',
  },
]

export default function PrijzenPage() {
  const [persons, setPersons] = useState(30)
  const [billing, setBilling] = useState<'per_person' | 'fixed'>('per_person')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const calcPrice = (v: typeof VARIANTS[0]) => {
    if (billing === 'fixed') return v.priceFixed || v.pricePerPerson * persons
    return v.pricePerPerson * persons
  }

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24 border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
            Transparante prijzen
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-[#0F172A] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Geen verrassingen.<br />Gewoon eerlijk.
          </h1>
          <p className="text-[#64748B] text-base max-w-xl mx-auto">
            Kies de variant die bij jouw groep past. Alle varianten inclusief AI-begeleiding, live scorebord en persoonlijk impactrapport.
          </p>

          {/* Toggle */}
          <div className="inline-flex bg-white border border-[#E2E8F0] rounded-xl p-1 mt-8">
            <button
              onClick={() => setBilling('per_person')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${billing === 'per_person' ? 'bg-[#0F172A] text-white' : 'text-[#64748B]'}`}
            >
              Per persoon
            </button>
            <button
              onClick={() => setBilling('fixed')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${billing === 'fixed' ? 'bg-[#0F172A] text-white' : 'text-[#64748B]'}`}
            >
              Per groep
            </button>
          </div>
        </div>
      </section>

      {/* ── Rekentool ── */}
      <section className="bg-white px-4 md:px-8 py-10 border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F8FAFC] rounded-2xl p-6 md:p-8">
            <h2 className="font-bold text-[#0F172A] mb-5">
              Bereken de prijs voor{' '}
              <span className="text-[#00C853] font-black">{persons} deelnemers</span>
            </h2>
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={persons}
              onChange={(e) => setPersons(Number(e.target.value))}
              className="w-full h-2 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#00E676] mb-3"
            />
            <div className="flex justify-between text-xs text-[#94A3B8] mb-6">
              <span>10 deelnemers</span>
              <span>200 deelnemers</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {VARIANTS.map((v) => {
                const total = calcPrice(v)
                const pp    = Math.round(total / persons)
                return (
                  <div key={v.slug} className="bg-white rounded-xl p-4 border border-[#E2E8F0] text-center">
                    <p className="text-xs font-bold text-[#94A3B8] mb-1">{v.name}</p>
                    <div
                      className="text-2xl font-black"
                      style={{ color: v.color, fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                    >
                      €{total}
                    </div>
                    <p className="text-[10px] text-[#94A3B8]">€{pp}/p.p.</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Variant cards ── */}
      <section className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VARIANTS.map((v) => (
              <div
                key={v.slug}
                className={`rounded-2xl p-6 border-2 relative flex flex-col ${
                  v.popular ? 'border-[#00E676] bg-[#F0FDF4]' : 'border-[#E2E8F0] bg-white'
                }`}
              >
                {v.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00E676] text-[#0F172A] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Meest populair
                  </div>
                )}
                {v.badge && !v.popular && (
                  <div className="absolute -top-3 left-6 bg-[#0F172A] text-[#00E676] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {v.badge}
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: v.bg }}>
                    <v.icon className="w-5 h-5" style={{ color: v.color }} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#0F172A]">{v.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: v.color }}>{v.target}</p>
                  </div>
                </div>

                {/* Prijs */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-4xl font-black"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)', color: v.popular ? '#00C853' : '#0F172A' }}
                    >
                      €{v.pricePerPerson}
                    </span>
                    <span className="text-sm text-[#94A3B8]">/ persoon</span>
                  </div>
                  {v.priceFixed > 0 && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">of €{v.priceFixed} vaste prijs (kleine groepen)</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {v.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#475569]">
                      <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/tochten"
                  className={`w-full py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-1.5 transition-colors ${
                    v.popular
                      ? 'bg-[#00E676] text-[#0F172A] hover:bg-[#00C853]'
                      : 'border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {v.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}

            {/* Maatwerk card */}
            <div className="rounded-2xl p-6 bg-[#0F172A] border-2 border-white/10 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-[#00E676]" />
              </div>
              <h3 className="font-black text-white mb-1">Maatwerk</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-4">Op aanvraag</p>
              <p className="text-[#64748B] text-sm leading-relaxed flex-1 mb-6">
                Eigen locaties, eigen opdrachten, eigen branding. We bouwen de perfecte tocht voor jouw organisatie — offerte op maat.
              </p>
              <Link
                href="/contact"
                className="w-full py-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] font-bold text-sm text-center flex items-center justify-center gap-1.5 hover:bg-[#00E676]/20 transition-colors"
              >
                Vraag offerte aan <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo / Gratis ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-12 border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-7 md:flex md:items-center md:gap-10 border border-[#E2E8F0]">
            <div className="mb-5 md:mb-0 flex-1">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Gratis proberen</p>
              <h3
                className="text-2xl font-black text-[#0F172A] mb-2"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Demo tocht beschikbaar
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                Wil je IctusGo eerst uitproberen? Vraag een gratis demo-sessie aan voor maximaal 10 deelnemers.
                We lopen samen door de werking en je kunt zelf alles testen.
              </p>
            </div>
            <Link
              href="/contact?subject=demo"
              className="shrink-0 inline-flex items-center gap-2 bg-[#00E676] text-[#0F172A] font-bold px-6 py-3 rounded-xl hover:bg-[#00C853] transition-colors"
            >
              Vraag demo aan
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Veelgestelde vragen</p>
          <h2
            className="text-3xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Heb je een vraag?
          </h2>

          <div className="space-y-3">
            {FAQ.map(({ q, a }, i) => (
              <div key={i} className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                >
                  <span className="font-semibold text-[#0F172A] text-sm">{q}</span>
                  <span className={`text-[#94A3B8] text-lg shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-[#64748B] text-sm leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[#64748B] text-sm mb-4">Staat jouw vraag er niet bij?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1E293B] transition-colors text-sm"
            >
              Stel ons jouw vraag <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
