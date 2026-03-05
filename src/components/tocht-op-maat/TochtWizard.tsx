'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, MapPin, Users, Clock, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TochtMissie {
  number: number
  title: string
  location: string
  description: string
  type: string
  points: number
}

interface GeneratedTocht {
  title: string
  tagline: string
  description: string
  gms_prediction: number
  difficulty: string
  highlights: string[]
  missions: TochtMissie[]
  impact_moment: string
  tips: string[]
}

interface WizardData {
  group: string
  vibe: string
  duration: string
  city: string
  participants: string
  extra: string
}

// ─── Opties ───────────────────────────────────────────────────────────────────

const GROEP_OPTIES = [
  { value: 'bedrijf',       label: 'Bedrijf',       icon: '🏢' },
  { value: 'vriendengroep', label: 'Vriendengroep', icon: '👯' },
  { value: 'stel',          label: 'Stel',          icon: '💑' },
  { value: 'familie',       label: 'Familie',       icon: '👨‍👩‍👧‍👦' },
  { value: 'sportclub',     label: 'Sportclub',     icon: '⚽' },
  { value: 'school',        label: 'School',        icon: '🏫' },
]

const SFEER_OPTIES = [
  { value: 'fun',     label: 'Fun & Speels', icon: '😄' },
  { value: 'actie',   label: 'Actie & Avontuur', icon: '🏃' },
  { value: 'liefde',  label: 'Romantisch', icon: '❤️' },
  { value: 'impact',  label: 'Maatschappelijk', icon: '🌱' },
  { value: 'cultuur', label: 'Cultuur & Historie', icon: '🏛️' },
  { value: 'sportief', label: 'Sportief', icon: '🏆' },
]

const DUUR_OPTIES = [
  { value: '60',  label: '1 uur' },
  { value: '90',  label: '1,5 uur' },
  { value: '120', label: '2 uur' },
  { value: '180', label: '3 uur' },
]

// ─── Subcomponenten ───────────────────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean
  onClick: () => void
  icon: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
        selected
          ? 'border-[#00E676] bg-[#F0FDF4] text-[#0F172A]'
          : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#00E676]/50'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  )
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all ${
            i < step ? 'bg-[#00E676]' : i === step ? 'bg-[#00E676]/60' : 'bg-[#E2E8F0]'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Stap 1: Groep ────────────────────────────────────────────────────────────

function StapGroep({
  data,
  onChange,
  onNext,
}: {
  data: WizardData
  onChange: (k: keyof WizardData, v: string) => void
  onNext: () => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#0F172A] mb-2">Voor wie is de tocht?</h2>
      <p className="text-[#64748B] text-sm mb-6">Kies het type groep dat meedoet.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {GROEP_OPTIES.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={data.group === opt.value}
            onClick={() => onChange('group', opt.value)}
            icon={opt.icon}
            label={opt.label}
          />
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!data.group}
        className="w-full py-3 rounded-xl font-bold text-[#0F172A] bg-[#00E676] hover:bg-[#00C853] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        Volgende <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Stap 2: Sfeer ────────────────────────────────────────────────────────────

function StapSfeer({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: WizardData
  onChange: (k: keyof WizardData, v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#0F172A] mb-2">Welke sfeer past bij jullie?</h2>
      <p className="text-[#64748B] text-sm mb-6">De AI stemt de opdrachten af op het thema.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {SFEER_OPTIES.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={data.vibe === opt.value}
            onClick={() => onChange('vibe', opt.value)}
            icon={opt.icon}
            label={opt.label}
          />
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#0F172A] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Terug
        </button>
        <button
          onClick={onNext}
          disabled={!data.vibe}
          className="flex-1 py-3 rounded-xl font-bold text-[#0F172A] bg-[#00E676] hover:bg-[#00C853] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          Volgende <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Stap 3: Details ─────────────────────────────────────────────────────────

function StapDetails({
  data,
  onChange,
  onSubmit,
  onBack,
  loading,
}: {
  data: WizardData
  onChange: (k: keyof WizardData, v: string) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}) {
  const valid = data.duration && data.city.trim() && data.participants.trim()
  return (
    <div>
      <h2 className="text-xl font-bold text-[#0F172A] mb-2">Wat zijn de details?</h2>
      <p className="text-[#64748B] text-sm mb-6">Geef de praktische info voor de tocht.</p>

      <div className="space-y-4 mb-8">
        {/* Duur */}
        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Duur
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DUUR_OPTIES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('duration', opt.value)}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  data.duration === opt.value
                    ? 'border-[#00E676] bg-[#F0FDF4] text-[#0F172A]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-[#00E676]/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stad */}
        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Stad
          </label>
          <input
            type="text"
            placeholder="bijv. Amsterdam, Rotterdam, Utrecht..."
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#00E676] outline-none text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
          />
        </div>

        {/* Deelnemers */}
        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Aantal deelnemers
          </label>
          <input
            type="number"
            min="2"
            max="500"
            placeholder="bijv. 25"
            value={data.participants}
            onChange={(e) => onChange('participants', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#00E676] outline-none text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
          />
        </div>

        {/* Extra wensen */}
        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-2">
            Extra wensen <span className="text-[#94A3B8] font-normal">(optioneel)</span>
          </label>
          <textarea
            rows={3}
            placeholder="bijv. rolstoeltoegankelijk, focus op duurzaamheid, verrassingselement..."
            value={data.extra}
            onChange={(e) => onChange('extra', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#00E676] outline-none text-[#0F172A] placeholder:text-[#94A3B8] transition-colors resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#0F172A] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Terug
        </button>
        <button
          onClick={onSubmit}
          disabled={!valid || loading}
          className="flex-1 py-3 rounded-xl font-bold text-[#0F172A] bg-[#00E676] hover:bg-[#00C853] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Tocht wordt gegenereerd...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Genereer mijn tocht
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Stap 4: Resultaat ────────────────────────────────────────────────────────

function StapResultaat({
  tocht,
  onReset,
}: {
  tocht: GeneratedTocht
  onReset: () => void
}) {
  const missionTypeLabel: Record<string, string> = {
    actie: 'Actie',
    quiz: 'Quiz',
    creatief: 'Creatief',
    sociaal: 'Sociaal',
    impact: 'Impact',
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-[#0F172A] rounded-2xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00E676] to-[#00C853]" />
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-xl font-black text-white leading-tight">{tocht.title}</h2>
            <p className="text-[#00E676] text-sm font-medium mt-1">{tocht.tagline}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-[#00E676]">{tocht.gms_prediction}</div>
            <div className="text-[#64748B] text-xs">GMS score</div>
          </div>
        </div>
        <p className="text-[#94A3B8] text-sm leading-relaxed">{tocht.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-[#CBD5E1]">
            {tocht.difficulty}
          </span>
        </div>
      </div>

      {/* Highlights */}
      {tocht.highlights?.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">Hoogtepunten</h3>
          <div className="space-y-2">
            {tocht.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                <CheckCircle2 className="w-4 h-4 text-[#00E676] flex-shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missies */}
      <div className="mb-5">
        <h3 className="text-sm font-bold text-[#0F172A] mb-3">Missies ({tocht.missions?.length ?? 0})</h3>
        <div className="space-y-3">
          {tocht.missions?.map((m) => (
            <div key={m.number} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {m.number}
                  </span>
                  <span className="font-semibold text-sm text-[#0F172A]">{m.title}</span>
                </div>
                <span className="text-xs font-bold text-[#00E676] flex-shrink-0">+{m.points}pt</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#94A3B8] mb-2 ml-8">
                <MapPin className="w-3 h-3" />
                <span>{m.location}</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed ml-8">{m.description}</p>
              <div className="ml-8 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] font-medium">
                  {missionTypeLabel[m.type] ?? m.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact moment */}
      {tocht.impact_moment && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-[#16A34A] mb-1">Impact moment</p>
          <p className="text-sm text-[#166534]">{tocht.impact_moment}</p>
        </div>
      )}

      {/* Tips */}
      {tocht.tips?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">Tips</h3>
          <div className="space-y-1.5">
            {tocht.tips.map((tip, i) => (
              <p key={i} className="text-sm text-[#475569] flex gap-2">
                <span className="text-[#00E676] font-bold">·</span>
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/tochten"
          className="flex-1 py-3 rounded-xl font-bold text-[#0F172A] bg-[#00E676] hover:bg-[#00C853] flex items-center justify-center gap-2 transition-colors text-center"
        >
          Bekijk marketplace <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={onReset}
          className="py-3 px-5 rounded-xl border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#0F172A] transition-colors text-sm font-medium"
        >
          Nieuwe tocht
        </button>
      </div>
    </div>
  )
}

// ─── Hoofdcomponent ───────────────────────────────────────────────────────────

const DEFAULT_DATA: WizardData = {
  group: '',
  vibe: '',
  duration: '120',
  city: '',
  participants: '',
  extra: '',
}

export default function TochtWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedTocht | null>(null)

  function handleChange(key: keyof WizardData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tocht-op-maat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Onbekende fout' }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const json = await res.json() as GeneratedTocht
      setResult(json)
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Er is iets misgegaan, probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setData(DEFAULT_DATA)
    setResult(null)
    setError(null)
    setStep(0)
  }

  const TOTAL_STEPS = 4

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 sm:p-8 w-full max-w-lg mx-auto">
      <StepIndicator step={step} total={TOTAL_STEPS} />

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === 0 && <StapGroep data={data} onChange={handleChange} onNext={() => setStep(1)} />}
      {step === 1 && <StapSfeer data={data} onChange={handleChange} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && (
        <StapDetails
          data={data}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onBack={() => setStep(1)}
          loading={loading}
        />
      )}
      {step === 3 && result && <StapResultaat tocht={result} onReset={handleReset} />}
    </div>
  )
}
