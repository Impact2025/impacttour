'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, MapPin, Users, Clock, Sparkles, CheckCircle2, Loader2, Mail,
  Building2, Heart, Home, Dumbbell, GraduationCap,
  Smile, Zap, Leaf, Landmark, Trophy, CreditCard, Tag, X,
  type LucideProps,
} from 'lucide-react'

type IconComponent = React.FC<LucideProps>

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
  aanvraagId?: string
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

const GROEP_OPTIES: { value: string; label: string; icon: IconComponent }[] = [
  { value: 'bedrijf',       label: 'Bedrijf',       icon: Building2 },
  { value: 'vriendengroep', label: 'Vriendengroep', icon: Users },
  { value: 'stel',          label: 'Koppel',        icon: Heart },
  { value: 'familie',       label: 'Familie',       icon: Home },
  { value: 'sportclub',     label: 'Sportclub',     icon: Dumbbell },
  { value: 'school',        label: 'School',        icon: GraduationCap },
]

const SFEER_OPTIES: { value: string; label: string; icon: IconComponent }[] = [
  { value: 'fun',      label: 'Fun & Speels',      icon: Smile },
  { value: 'actie',    label: 'Actie & Avontuur',  icon: Zap },
  { value: 'liefde',   label: 'Romantisch',        icon: Heart },
  { value: 'impact',   label: 'Maatschappelijk',   icon: Leaf },
  { value: 'cultuur',  label: 'Cultuur & Historie', icon: Landmark },
  { value: 'sportief', label: 'Sportief',           icon: Trophy },
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
  icon: Icon,
  label,
}: {
  selected: boolean
  onClick: () => void
  icon: IconComponent
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
      <Icon className={`w-6 h-6 ${selected ? 'text-[#00C853]' : 'text-[#94A3B8]'}`} />
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
  const [postcode, setPostcode] = useState('')
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'found' | 'error'>('idle')

  async function lookupPostcode(value: string) {
    const cleaned = value.replace(/\s/g, '').toUpperCase()
    if (!/^\d{4}[A-Z]{2}$/.test(cleaned)) return
    setLookupState('loading')
    try {
      const res = await fetch(`/api/postcode?q=${cleaned}`)
      const json = await res.json()
      const city: string = json?.city ?? ''
      if (city) {
        onChange('city', city)
        setLookupState('found')
      } else {
        setLookupState('error')
      }
    } catch {
      setLookupState('error')
    }
  }

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

        {/* Postcode → Woonplaats */}
        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Postcode
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="bijv. 1234 AB"
              maxLength={7}
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value)
                setLookupState('idle')
                onChange('city', '')
                lookupPostcode(e.target.value)
              }}
              className={`flex-1 px-4 py-3 rounded-xl border-2 outline-none text-[#0F172A] placeholder:text-[#94A3B8] transition-colors ${
                lookupState === 'found'
                  ? 'border-[#00E676] bg-[#F0FDF4]'
                  : lookupState === 'error'
                  ? 'border-red-300'
                  : 'border-[#E2E8F0] focus:border-[#00E676]'
              }`}
            />
            {lookupState === 'loading' && (
              <div className="flex items-center px-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#94A3B8]" />
              </div>
            )}
          </div>
          {lookupState === 'found' && data.city && (
            <p className="mt-1.5 text-sm text-[#00A854] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {data.city}
            </p>
          )}
          {lookupState === 'error' && (
            <p className="mt-1.5 text-xs text-red-400">Postcode niet gevonden — vul de stad handmatig in.</p>
          )}
          {lookupState === 'error' && (
            <input
              type="text"
              placeholder="Vul je stad in"
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#00E676] outline-none text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
            />
          )}
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
  wizardData,
  onReset,
  onCheckout,
}: {
  tocht: GeneratedTocht
  wizardData: WizardData
  onReset: () => void
  onCheckout: () => void
}) {
  const [email, setEmail] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleEmailSend() {
    if (!email.trim() || emailState === 'sending' || emailState === 'sent') return
    setEmailState('sending')
    try {
      const res = await fetch('/api/tocht-op-maat/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), tocht, wizardData }),
      })
      if (!res.ok) throw new Error()
      setEmailState('sent')
    } catch {
      setEmailState('error')
    }
  }

  const missionTypeLabel: Record<string, string> = {
    actie: 'Actie',
    quiz: 'Quiz',
    creatief: 'Creatief',
    sociaal: 'Sociaal',
    impact: 'Impact',
  }

  // Koppel groepstype aan marketplace variant + prijs
  const variantInfo: Record<string, { slug: string; label: string; prijs: string }> = {
    bedrijf:      { slug: 'wijktocht',    label: 'WijkTocht',           prijs: '€12/pp' },
    vriendengroep:{ slug: 'impactsprint', label: 'ImpactSprint',        prijs: '€9/pp' },
    stel:         { slug: 'familietocht', label: 'Familie & Koppels',   prijs: '€9/pp · min. €18' },
    familie:      { slug: 'familietocht', label: 'Familie & Koppels',   prijs: '€9/pp' },
    sportclub:    { slug: 'wijktocht',    label: 'WijkTocht',           prijs: '€12/pp' },
    school:       { slug: 'jeugdtocht',   label: 'JeugdTocht',          prijs: '€6/pp · min. €90' },
  }
  const variant = variantInfo[wizardData.group] ?? { slug: 'wijktocht', label: 'WijkTocht', prijs: '€12/pp' }

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
        {/* Variant + prijs hint */}
        <div className="mt-3 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
          <Heart className="w-3.5 h-3.5 text-[#EC4899] shrink-0" />
          <span className="text-xs text-[#94A3B8]">Passende variant:</span>
          <span className="text-xs font-bold text-white">{variant.label}</span>
          <span className="text-xs text-[#00E676] ml-auto font-semibold">{variant.prijs}</span>
        </div>
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

      {/* Email capture */}
      <div className="bg-[#0F172A] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-[#00E676]" />
          <p className="text-white font-bold text-sm">Ontvang dit concept in je inbox</p>
        </div>
        <p className="text-[#64748B] text-xs mb-4">
          Wij sturen het complete plan per e-mail — en nemen contact op om het te realiseren.
        </p>

        {emailState === 'sent' ? (
          <div className="flex items-center gap-2 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
            <p className="text-[#00E676] text-sm font-semibold">Verzonden! Check je inbox — wij nemen binnenkort contact op.</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSend()}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-[#475569] text-sm outline-none focus:border-[#00E676]/50 transition-colors"
            />
            <button
              onClick={handleEmailSend}
              disabled={!email.trim() || emailState === 'sending'}
              className="px-4 py-2.5 rounded-xl bg-[#00E676] text-[#0F172A] font-bold text-sm hover:bg-[#00C853] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shrink-0"
            >
              {emailState === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {emailState === 'sending' ? 'Bezig...' : 'Stuur'}
            </button>
          </div>
        )}
        {emailState === 'error' && (
          <p className="text-red-400 text-xs mt-2">Er ging iets mis, probeer het opnieuw.</p>
        )}
      </div>

      {/* Primary CTA: speelbaar maken */}
      {tocht.aanvraagId && (
        <button
          onClick={onCheckout}
          className="w-full py-3.5 rounded-xl font-bold text-[#0F172A] bg-[#00E676] hover:bg-[#00C853] flex items-center justify-center gap-2 transition-colors mb-3"
        >
          <CreditCard className="w-4 h-4" /> Maak speelbaar — €49
        </button>
      )}

      {/* Secondary CTAs */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          href={`/tochten?variant=${variant.slug}`}
          className="flex-1 py-2.5 rounded-xl font-bold text-[#0F172A] border-2 border-[#00E676] hover:bg-[#F0FDF4] flex items-center justify-center gap-2 transition-colors text-sm"
        >
          Bekijk marketplace <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={onReset}
          className="py-2.5 px-4 rounded-xl border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#0F172A] transition-colors text-sm font-medium"
        >
          Nieuwe tocht
        </button>
      </div>
    </div>
  )
}

// ─── Stap 5: Checkout ─────────────────────────────────────────────────────────

interface CouponState {
  status: 'idle' | 'checking' | 'valid' | 'invalid'
  message: string
  isFree: boolean
  discountLabel: string
  finalAmountCents: number
}

function StapCheckout({
  tocht,
  onBack,
}: {
  tocht: GeneratedTocht
  onBack: () => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<CouponState>({
    status: 'idle',
    message: '',
    isFree: false,
    discountLabel: '',
    finalAmountCents: 4900,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = firstName.trim() && lastName.trim() && email.includes('@')
  const displayPrice = coupon.finalAmountCents === 0 ? 'Gratis' : `€${(coupon.finalAmountCents / 100).toFixed(2).replace('.', ',')}`

  async function handleCouponCheck() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCoupon((p) => ({ ...p, status: 'checking', message: '' }))
    try {
      const res = await fetch('/api/tocht-op-maat/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const json = await res.json()
      if (!res.ok || !json.valid) {
        setCoupon({ status: 'invalid', message: json.error ?? 'Ongeldige code', isFree: false, discountLabel: '', finalAmountCents: 4900 })
      } else {
        setCoupon({
          status: 'valid',
          message: json.discountLabel,
          isFree: json.isFree,
          discountLabel: json.discountLabel,
          finalAmountCents: json.finalAmountCents,
        })
      }
    } catch {
      setCoupon({ status: 'invalid', message: 'Kon coupon niet controleren', isFree: false, discountLabel: '', finalAmountCents: 4900 })
    }
  }

  function clearCoupon() {
    setCouponInput('')
    setCoupon({ status: 'idle', message: '', isFree: false, discountLabel: '', finalAmountCents: 4900 })
  }

  async function handleBetaal() {
    if (!valid || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tocht-op-maat/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aanvraagId: tocht.aanvraagId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          couponCode: coupon.status === 'valid' ? couponInput.trim().toUpperCase() : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      // Gratis flow → redirect naar bevestiging; betaald → MSP betaalpagina
      window.location.href = json.free ? json.redirectUrl : json.paymentUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Er ging iets mis, probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#0F172A] mb-1">Jouw speelbare tocht</h2>
      <p className="text-[#64748B] text-sm mb-5">Vul je gegevens in en betaal eenmalig.</p>

      {/* Tocht samenvatting */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-[#00C853] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0F172A] truncate">{tocht.title}</p>
          <p className="text-xs text-[#64748B]">Eenmalig speelbaar · GPS-tocht op maat</p>
        </div>
        <div className="text-right shrink-0">
          {coupon.status === 'valid' && coupon.finalAmountCents < 4900 && (
            <p className="text-xs text-[#94A3B8] line-through">€49,00</p>
          )}
          <span className={`text-lg font-black ${coupon.isFree ? 'text-[#00C853]' : 'text-[#0F172A]'}`}>
            {displayPrice}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Voornaam</label>
            <input
              type="text"
              placeholder="Anna"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E2E8F0] focus:border-[#00E676] outline-none text-[#0F172A] placeholder:text-[#94A3B8] text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Achternaam</label>
            <input
              type="text"
              placeholder="de Vries"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E2E8F0] focus:border-[#00E676] outline-none text-[#0F172A] placeholder:text-[#94A3B8] text-sm transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">E-mailadres</label>
          <input
            type="email"
            placeholder="jouw@email.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E2E8F0] focus:border-[#00E676] outline-none text-[#0F172A] placeholder:text-[#94A3B8] text-sm transition-colors"
          />
          <p className="text-xs text-[#94A3B8] mt-1">Je ontvangt de speellink op dit adres.</p>
        </div>

        {/* Coupon */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Kortingscode
            <span className="text-[#94A3B8] font-normal">(optioneel)</span>
          </label>
          {coupon.status === 'valid' ? (
            <div className="flex items-center gap-2 bg-[#F0FDF4] border-2 border-[#00E676] rounded-xl px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
              <span className="text-sm font-semibold text-[#0F172A] flex-1">
                {couponInput.toUpperCase()}
              </span>
              <span className="text-xs text-[#00C853] font-medium">{coupon.discountLabel}</span>
              <button onClick={clearCoupon} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="bijv. IMPACT2026"
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value); if (coupon.status !== 'idle') clearCoupon() }}
                onKeyDown={(e) => e.key === 'Enter' && handleCouponCheck()}
                className={`flex-1 px-3 py-2.5 rounded-xl border-2 outline-none text-[#0F172A] placeholder:text-[#94A3B8] text-sm transition-colors ${
                  coupon.status === 'invalid' ? 'border-red-300 bg-red-50' : 'border-[#E2E8F0] focus:border-[#00E676]'
                }`}
              />
              <button
                onClick={handleCouponCheck}
                disabled={!couponInput.trim() || coupon.status === 'checking'}
                className="px-4 py-2.5 rounded-xl border-2 border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:border-[#00E676] disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1.5"
              >
                {coupon.status === 'checking' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Toepassen
              </button>
            </div>
          )}
          {coupon.status === 'invalid' && (
            <p className="text-xs text-red-500 mt-1">{coupon.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#0F172A] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Terug
        </button>
        <button
          onClick={handleBetaal}
          disabled={!valid || loading}
          className="flex-1 py-3 rounded-xl font-bold text-[#0F172A] bg-[#00E676] hover:bg-[#00C853] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {coupon.isFree ? 'Tocht aanmaken…' : 'Doorsturen naar betaling…'}</>
          ) : coupon.isFree ? (
            <><CheckCircle2 className="w-4 h-4" /> Ontvang gratis tocht</>
          ) : (
            <><CreditCard className="w-4 h-4" /> Betaal {displayPrice}</>
          )}
        </button>
      </div>
      {!coupon.isFree && (
        <p className="text-xs text-[#94A3B8] text-center mt-3">
          Veilig betalen via MultiSafepay · iDEAL, creditcard &amp; meer
        </p>
      )}
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

  // Stap 4 (checkout) toont geen progress indicator
  const showIndicator = step < 4
  const TOTAL_STEPS = 4

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 sm:p-8 w-full max-w-lg mx-auto">
      {showIndicator && <StepIndicator step={step} total={TOTAL_STEPS} />}

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
      {step === 3 && result && (
        <StapResultaat
          tocht={result}
          wizardData={data}
          onReset={handleReset}
          onCheckout={() => setStep(4)}
        />
      )}
      {step === 4 && result && (
        <StapCheckout
          tocht={result}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
