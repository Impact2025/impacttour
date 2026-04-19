'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type Audience = 'bedrijf' | 'school' | 'gezin'
type Duration = 'kort' | 'halve-dag' | 'flexibel'
type Size = 'klein' | 'middelgroot' | 'groot'
type Step = 1 | 2 | 3 | 'result'

interface Answers {
  audience: Audience | null
  duration: Duration | null
  size: Size | null
}

const RESULT_MAP: Record<string, {
  name: string
  tagline: string
  price: string
  color: string
  bg: string
  href: string
  features: string[]
}> = {
  impactsprint: {
    name: 'ImpactSprint',
    tagline: 'Maximale impact in 90 minuten',
    price: '€9/p.p.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    href: '/tochten?variant=impactsprint',
    features: ['5 checkpoints', '90 minuten', 'AI Scout', 'Meest populair'],
  },
  wijktocht: {
    name: 'WijkTocht',
    tagline: 'De klassieke teamdag met GPS',
    price: '€12/p.p.',
    color: '#3B82F6',
    bg: '#EFF6FF',
    href: '/tochten?variant=wijktocht',
    features: ['8 checkpoints', 'Halve dag', 'AI Scout', 'PDF rapport'],
  },
  voetbalmissie: {
    name: 'VoetbalMissie',
    tagline: 'Sociale missies in voetbaltaal',
    price: '€6/kind',
    color: '#16a34a',
    bg: '#F0FDF4',
    href: '/tochten?variant=voetbalmissie',
    features: ['Kids-veilig', 'AVG-compliant', 'Trainer dashboard', '5 checkpoints'],
  },
  familietocht: {
    name: 'FamilieTocht',
    tagline: 'GPS-avontuur voor het hele gezin',
    price: '€9/p.p.',
    color: '#EC4899',
    bg: '#FDF2F8',
    href: '/tochten?variant=familietocht',
    features: ['Vanaf 2 pers.', 'Gezinsroutes', 'AI Buddy', 'Herinneringsrapport'],
  },
  maatwerk: {
    name: 'Maatwerk',
    tagline: 'Volledig op maat voor grote groepen',
    price: 'Vanaf €750',
    color: '#F59E0B',
    bg: '#FFFBEB',
    href: '/contact?subject=maatwerk',
    features: ['50+ personen', 'Eigen locatie', 'Eigen branding', 'Wij regelen alles'],
  },
}

function recommend(answers: Answers): string {
  if (answers.audience === 'school') return 'voetbalmissie'
  if (answers.audience === 'gezin') return 'familietocht'
  if (answers.audience === 'bedrijf') {
    if (answers.size === 'groot') return 'maatwerk'
    if (answers.duration === 'kort' || answers.size === 'klein') return 'impactsprint'
    return 'wijktocht'
  }
  return 'impactsprint'
}

const Q1_OPTIONS = [
  { value: 'bedrijf' as Audience,  label: 'Bedrijf of team',     emoji: '🏢', desc: 'Collega\'s, teamdag, corporate' },
  { value: 'school'  as Audience,  label: 'School of sportclub', emoji: '⚽', desc: 'Kinderen, jeugd, club' },
  { value: 'gezin'   as Audience,  label: 'Gezin of vrienden',   emoji: '👨‍👩‍👧‍👦', desc: 'Familie, koppel, weekend' },
]

const Q2_OPTIONS = [
  { value: 'kort'      as Duration, label: '90 minuten',  emoji: '⚡', desc: 'Compact, maximale impact' },
  { value: 'halve-dag' as Duration, label: 'Halve dag',   emoji: '🕐', desc: '3–4 uur, uitgebreid' },
  { value: 'flexibel'  as Duration, label: 'Flexibel',    emoji: '📅', desc: 'Wij denken mee' },
]

const Q3_OPTIONS = [
  { value: 'klein'       as Size, label: '2–15 personen',   emoji: '👥', desc: 'Klein team' },
  { value: 'middelgroot' as Size, label: '16–50 personen',  emoji: '👫', desc: 'Afdeling of club' },
  { value: 'groot'       as Size, label: '50+ personen',    emoji: '🏟️', desc: 'Grote organisatie' },
]

export function VariantWizard() {
  const [step, setStep] = useState<Step>(1)
  const [answers, setAnswers] = useState<Answers>({ audience: null, duration: null, size: null })

  function answer(field: keyof Answers, value: string) {
    const next = { ...answers, [field]: value } as Answers
    setAnswers(next)

    if (field === 'audience') {
      if (value === 'school' || value === 'gezin') {
        setStep('result')
      } else {
        setStep(2)
      }
    } else if (field === 'duration') {
      setStep(3)
    } else {
      setStep('result')
    }
  }

  function reset() {
    setStep(1)
    setAnswers({ audience: null, duration: null, size: null })
  }

  const slug = step === 'result' ? recommend(answers) : null
  const result = slug ? RESULT_MAP[slug] : null

  const totalSteps = answers.audience === 'bedrijf' ? 3 : 1
  const currentStepNum = step === 'result' ? totalSteps : (step as number)

  return (
    <div className="bg-white rounded-3xl border-2 border-[#E2E8F0] p-6 md:p-8 max-w-2xl mx-auto shadow-sm">

      {/* Progress bar */}
      {step !== 'result' && (
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor:
                  s <= currentStepNum ? '#00E676' : '#E2E8F0',
              }}
            />
          ))}
        </div>
      )}

      {/* Q1: Voor wie? */}
      {step === 1 && (
        <>
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Vraag 1 van 3
          </p>
          <h3
            className="text-xl font-black text-[#0F172A] mb-6"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Voor wie organiseer je de tocht?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Q1_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => answer('audience', opt.value)}
                className="flex flex-col items-center text-center p-4 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#00E676] hover:bg-[#F0FDF4] transition-all group"
              >
                <span className="text-3xl mb-2">{opt.emoji}</span>
                <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#16a34a]">
                  {opt.label}
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Q2: Hoeveel tijd? */}
      {step === 2 && (
        <>
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Vraag 2 van 3
          </p>
          <h3
            className="text-xl font-black text-[#0F172A] mb-6"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Hoeveel tijd heb je?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Q2_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => answer('duration', opt.value)}
                className="flex flex-col items-center text-center p-4 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#00E676] hover:bg-[#F0FDF4] transition-all group"
              >
                <span className="text-3xl mb-2">{opt.emoji}</span>
                <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#16a34a]">
                  {opt.label}
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-4 text-xs text-[#94A3B8] hover:text-[#64748B] underline"
          >
            ← Terug
          </button>
        </>
      )}

      {/* Q3: Groepsgrootte? */}
      {step === 3 && (
        <>
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Vraag 3 van 3
          </p>
          <h3
            className="text-xl font-black text-[#0F172A] mb-6"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Hoe groot is je groep?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Q3_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => answer('size', opt.value)}
                className="flex flex-col items-center text-center p-4 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#00E676] hover:bg-[#F0FDF4] transition-all group"
              >
                <span className="text-3xl mb-2">{opt.emoji}</span>
                <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#16a34a]">
                  {opt.label}
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="mt-4 text-xs text-[#94A3B8] hover:text-[#64748B] underline"
          >
            ← Terug
          </button>
        </>
      )}

      {/* Result */}
      {step === 'result' && result && (
        <>
          <p className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest mb-2">
            Aanbeveling voor jou
          </p>
          <h3
            className="text-2xl font-black italic text-[#0F172A] mb-5"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            {result.name} past perfect bij jouw groep.
          </h3>
          <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: result.bg }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-black text-[#0F172A] text-lg">{result.name}</p>
                <p className="text-sm text-[#64748B]">{result.tagline}</p>
              </div>
              <span
                className="text-2xl font-black shrink-0"
                style={{ color: result.color, fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {result.price}
              </span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {result.features.map((f) => (
                <li
                  key={f}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border"
                  style={{ color: result.color, borderColor: `${result.color}40` }}
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <Link
              href={result.href}
              className="flex-1 py-3 rounded-xl bg-[#00E676] text-[#0F172A] font-bold text-sm text-center flex items-center justify-center gap-1.5 hover:bg-[#00C853] transition-colors"
            >
              Bekijk {result.name} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              Opnieuw
            </button>
          </div>
        </>
      )}
    </div>
  )
}
