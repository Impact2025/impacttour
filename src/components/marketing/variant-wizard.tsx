'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronLeft,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  Clock,
  Calendar,
  User,
  Users,
  Building2,
  type LucideIcon,
} from 'lucide-react'

type Audience = 'bedrijf' | 'school' | 'gezin'
type Duration = 'kort' | 'halve-dag' | 'flexibel'
type Size = 'klein' | 'middelgroot' | 'groot'
type Step = 1 | 2 | 3 | 'result'

interface Answers {
  audience: Audience | null
  duration: Duration | null
  size: Size | null
}

interface Option {
  value: string
  label: string
  desc: string
  Icon: LucideIcon
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

const Q1_OPTIONS: Option[] = [
  { value: 'bedrijf', label: 'Bedrijf of team',     desc: "Collega's, teamdag, corporate", Icon: Briefcase },
  { value: 'school',  label: 'School of sportclub', desc: 'Kinderen, jeugd, club',         Icon: GraduationCap },
  { value: 'gezin',   label: 'Gezin of vrienden',   desc: 'Familie, koppel, weekend',      Icon: Heart },
]

const Q2_OPTIONS: Option[] = [
  { value: 'kort',      label: '90 minuten', desc: 'Compact, maximale impact', Icon: Zap },
  { value: 'halve-dag', label: 'Halve dag',  desc: '3–4 uur, uitgebreid',      Icon: Clock },
  { value: 'flexibel',  label: 'Flexibel',   desc: 'Wij denken mee',           Icon: Calendar },
]

const Q3_OPTIONS: Option[] = [
  { value: 'klein',       label: '2–15 personen',  desc: 'Klein team',         Icon: User },
  { value: 'middelgroot', label: '16–50 personen', desc: 'Afdeling of club',   Icon: Users },
  { value: 'groot',       label: '50+ personen',   desc: 'Grote organisatie',  Icon: Building2 },
]

function OptionCard({ opt, onClick }: { opt: Option; onClick: () => void }) {
  const { Icon } = opt
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 text-left p-4 rounded-xl border border-[#E2E8F0] hover:border-[#00E676] hover:bg-[#F0FDF4] transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0 group-hover:bg-[#DCFCE7] transition-colors">
        <Icon className="w-4 h-4 text-[#64748B] group-hover:text-[#16a34a] transition-colors" />
      </div>
      <div>
        <p className="font-bold text-sm text-[#0F172A] group-hover:text-[#0F172A]">{opt.label}</p>
        <p className="text-[11px] text-[#94A3B8] mt-0.5">{opt.desc}</p>
      </div>
    </button>
  )
}

export function VariantWizard() {
  const [step, setStep] = useState<Step>(1)
  const [answers, setAnswers] = useState<Answers>({ audience: null, duration: null, size: null })

  function answer(field: keyof Answers, value: string) {
    const next = { ...answers, [field]: value } as Answers
    setAnswers(next)
    if (field === 'audience') {
      setStep(value === 'school' || value === 'gezin' ? 'result' : 2)
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
  const currentStepNum = step === 'result' ? (answers.audience === 'bedrijf' ? 3 : 1) : (step as number)

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 max-w-2xl mx-auto">

      {/* Progress */}
      {step !== 'result' && (
        <div className="flex gap-1.5 mb-7">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-0.5 flex-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: s <= currentStepNum ? '#00E676' : '#E2E8F0' }}
            />
          ))}
        </div>
      )}

      {/* Q1 */}
      {step === 1 && (
        <>
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-1.5">
            Vraag 1 van 3
          </p>
          <p className="font-bold text-[#0F172A] text-base mb-5">
            Voor wie organiseer je de tocht?
          </p>
          <div className="flex flex-col gap-2">
            {Q1_OPTIONS.map((opt) => (
              <OptionCard key={opt.value} opt={opt} onClick={() => answer('audience', opt.value)} />
            ))}
          </div>
        </>
      )}

      {/* Q2 */}
      {step === 2 && (
        <>
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-1.5">
            Vraag 2 van 3
          </p>
          <p className="font-bold text-[#0F172A] text-base mb-5">
            Hoeveel tijd heb je?
          </p>
          <div className="flex flex-col gap-2">
            {Q2_OPTIONS.map((opt) => (
              <OptionCard key={opt.value} opt={opt} onClick={() => answer('duration', opt.value)} />
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-5 flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Terug
          </button>
        </>
      )}

      {/* Q3 */}
      {step === 3 && (
        <>
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-1.5">
            Vraag 3 van 3
          </p>
          <p className="font-bold text-[#0F172A] text-base mb-5">
            Hoe groot is je groep?
          </p>
          <div className="flex flex-col gap-2">
            {Q3_OPTIONS.map((opt) => (
              <OptionCard key={opt.value} opt={opt} onClick={() => answer('size', opt.value)} />
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="mt-5 flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Terug
          </button>
        </>
      )}

      {/* Result */}
      {step === 'result' && result && (
        <>
          <p className="text-[10px] font-semibold text-[#00E676] uppercase tracking-widest mb-1.5">
            Aanbeveling
          </p>
          <p className="font-bold text-[#0F172A] text-lg mb-5">
            {result.name} past het best bij jouw groep.
          </p>
          <div className="rounded-xl border border-[#E2E8F0] p-4 mb-4" style={{ backgroundColor: result.bg }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-[#0F172A]">{result.name}</p>
                <p className="text-sm text-[#64748B]">{result.tagline}</p>
              </div>
              <span
                className="text-xl font-black shrink-0"
                style={{ color: result.color, fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {result.price}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.features.map((f) => (
                <span
                  key={f}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border"
                  style={{ color: result.color, borderColor: `${result.color}30` }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={result.href}
              className="flex-1 py-2.5 rounded-xl bg-[#00E676] text-[#0F172A] font-bold text-sm text-center flex items-center justify-center gap-1.5 hover:bg-[#00C853] transition-colors"
            >
              Bekijk {result.name} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={reset}
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              Opnieuw
            </button>
          </div>
        </>
      )}
    </div>
  )
}
