'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Users, User, Mail, Building2,
  Tag, ArrowRight, ArrowLeft, CheckCircle2,
  Clock, AlertCircle, Loader2, Lock, Star, Shield, Sparkles,
} from 'lucide-react'

type Tour = {
  id: string
  name: string
  variant: string
  estimatedDurationMin: number
  maxTeams: number
  priceInCents: number
  pricingModel: string
  pricePerPersonCents: number
}

type CouponResult = {
  valid: boolean
  code?: string
  discountLabel?: string
  discountCents?: number
  finalAmountCents?: number
  isFree?: boolean
  error?: string
}

const VARIANT_LABELS: Record<string, string> = {
  wijktocht: 'WijkTocht', impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht', jeugdtocht: 'JeugdTocht', voetbalmissie: 'VoetbalMissie',
}

const VARIANT_COLORS: Record<string, string> = {
  wijktocht: '#3B82F6', impactsprint: '#8B5CF6', familietocht: '#EC4899',
  jeugdtocht: '#F59E0B', voetbalmissie: '#00C853',
}

function formatEur(cents: number) {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function BookingWizard({ tour }: { tour: Tour }) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('14:00')
  const [teamCount, setTeamCount] = useState(4)
  const [participantCount, setParticipantCount] = useState(20)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const isFreeBase = tour.priceInCents === 0 && tour.pricingModel === 'flat'
  const isPerPerson = tour.pricingModel === 'per_person'
  const originalAmountCents = isPerPerson
    ? tour.pricePerPersonCents * participantCount
    : tour.priceInCents
  const finalAmountCents = couponResult?.valid
    ? (couponResult.finalAmountCents ?? originalAmountCents)
    : originalAmountCents
  const isFree = isFreeBase || (couponResult?.valid && couponResult.isFree)
  const variantColor = VARIANT_COLORS[tour.variant] ?? '#00E676'
  const step2Valid = firstName.trim().length > 0 && lastName.trim().length > 0 && isValidEmail(email)

  useEffect(() => {
    if (couponCode.length < 3) { setCouponResult(null); return }
    const timer = setTimeout(async () => {
      setCouponLoading(true)
      try {
        const res = await fetch('/api/marketplace/coupon/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: couponCode, tourId: tour.id, originalAmountCents }),
        })
        setCouponResult(await res.json())
      } catch {
        setCouponResult({ valid: false, error: 'Kon code niet controleren' })
      } finally {
        setCouponLoading(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [couponCode, originalAmountCents, tour.id])

  const handleSubmit = async () => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const scheduledAt = scheduledDate
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : undefined
      const res = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id, scheduledAt,
          participantCount: isPerPerson ? participantCount : undefined,
          teamCount, firstName, lastName, email,
          organizationName: organizationName || undefined,
          couponCode: couponResult?.valid ? couponCode : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || 'Er ging iets mis.'); return }
      if (data.free) { setDone(true) }
      else if (data.paymentUrl) { window.location.href = data.paymentUrl }
    } catch {
      setSubmitError('Verbindingsfout. Controleer je internet en probeer opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Succes scherm ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#00E676] to-[#00C853]" />
            <div className="p-8 text-center">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-[#00C853]" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2
                className="text-3xl font-black text-[#0F172A] mb-2"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Tocht gereserveerd!
              </h2>
              <p className="text-[#64748B] mb-6 leading-relaxed">
                Check je inbox op{' '}
                <strong className="text-[#0F172A]">{email}</strong> — de setup-link is onderweg.
              </p>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-left space-y-3 mb-6">
                <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Volgende stappen</p>
                {[
                  'Open de link in je e-mail',
                  'Geef je sessie een naam',
                  'Maak teams aan & stuur deep-links',
                  'Start de tocht op de dag zelf!',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00E676] text-[#0F172A] flex items-center justify-center text-xs font-black shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-[#374151]">{text}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#94A3B8]">Geen e-mail? Wacht 2 min en check je spam.</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">

      {/* ── Sticky top bar met progressie ─────────────────────────────────────── */}
      <div className="bg-[#0F172A] sticky top-0 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-2 flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.push(`/tochten/${tour.id}`)}
            className="flex items-center gap-1.5 text-[#64748B] hover:text-white transition-colors text-sm py-1 px-2 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Terug</span>
          </button>

          <div className="flex-1 flex items-center gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex-1 h-1.5 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: step >= n ? variantColor : '#1E293B',
                  opacity: step > n ? 0.5 : 1,
                }}
              />
            ))}
          </div>

          <span className="text-[#64748B] text-xs font-medium whitespace-nowrap">
            {step === 1 ? 'Stap 1 — Planning' : step === 2 ? 'Stap 2 — Gegevens' : 'Stap 3 — Bevestigen'}
          </span>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-3 flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: `${variantColor}25`, color: variantColor }}
          >
            {VARIANT_LABELS[tour.variant] ?? tour.variant}
          </span>
          <span className="text-white text-sm font-medium truncate">{tour.name}</span>
          <span className="text-[#475569] text-xs ml-auto flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {tour.estimatedDurationMin} min
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── STAP 1: Planning ──────────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div>
              <h2
                className="text-2xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Plan je tocht
              </h2>
              <p className="text-[#94A3B8] text-sm mt-1">Kies een datum en bepaal hoeveel teams er meedoen.</p>
            </div>

            {/* Datum */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
                <Calendar className="w-3.5 h-3.5" />
                Datum &amp; tijdstip
                <span className="font-normal text-[#CBD5E1] normal-case tracking-normal">— optioneel</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-28 px-3 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                />
              </div>
              {scheduledDate && (
                <p className="text-xs text-[#00C853] mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString('nl-NL', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })} om {scheduledTime}
                </p>
              )}
            </div>

            {/* Aantal teams */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">
                <Users className="w-3.5 h-3.5" />
                Aantal teams
              </label>

              <div className="flex items-center gap-5 mb-4">
                <button
                  type="button"
                  onClick={() => setTeamCount(Math.max(1, teamCount - 1))}
                  className="w-11 h-11 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] hover:text-[#0F172A] transition-colors text-xl font-bold leading-none"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <div
                    className="text-5xl font-black text-[#0F172A]"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {teamCount}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">
                    van max {tour.maxTeams} · ±{teamCount * 4}–{teamCount * 6} deelnemers
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTeamCount(Math.min(tour.maxTeams, teamCount + 1))}
                  className="w-11 h-11 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] hover:text-[#0F172A] transition-colors text-xl font-bold leading-none"
                >
                  +
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[2, 4, 6, 8, 10].filter((n) => n <= tour.maxTeams).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTeamCount(n)}
                    className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                      teamCount === n
                        ? 'bg-[#00E676] border-[#00E676] text-[#0F172A] shadow-sm'
                        : 'border-[#E2E8F0] text-[#64748B] hover:border-[#00E676]/50 hover:text-[#0F172A]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Deelnemers (per_person pricing) */}
            {isPerPerson && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">
                  <Users className="w-3.5 h-3.5" />
                  Totaal deelnemers
                </label>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                    className="w-11 h-11 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] transition-colors text-xl font-bold leading-none"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <div
                      className="text-5xl font-black text-[#0F172A]"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                    >
                      {participantCount}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">
                      × {formatEur(tour.pricePerPersonCents)} ={' '}
                      <strong className="text-[#0F172A]">{formatEur(originalAmountCents)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParticipantCount(Math.min(500, participantCount + 1))}
                    className="w-11 h-11 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] transition-colors text-xl font-bold leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-base hover:bg-[#00C853] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Volgende stap <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* ── STAP 2: Jouw gegevens ──────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <div>
              <h2
                className="text-2xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Jouw gegevens
              </h2>
              <p className="text-[#94A3B8] text-sm mt-1">We sturen de setup-link naar je e-mailadres.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    <User className="w-3 h-3" /> Voornaam
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jan"
                    autoComplete="given-name"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Achternaam
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Jansen"
                    autoComplete="family-name"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  <Mail className="w-3 h-3" /> E-mailadres
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="jan@bedrijf.nl"
                    autoComplete="email"
                    className={`w-full px-4 py-3 pr-10 border rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 text-sm transition-colors ${
                      emailTouched && email && !isValidEmail(email)
                        ? 'border-red-300 focus:ring-red-200'
                        : emailTouched && isValidEmail(email)
                        ? 'border-[#00E676] focus:ring-[#00E676]/30'
                        : 'border-[#E2E8F0] focus:ring-[#00E676]/30 focus:border-[#00E676]'
                    }`}
                  />
                  {emailTouched && isValidEmail(email) && (
                    <CheckCircle2 className="absolute right-3 top-3.5 w-4 h-4 text-[#00C853] pointer-events-none" />
                  )}
                </div>
                {emailTouched && email && !isValidEmail(email) ? (
                  <p className="text-xs text-red-500 mt-1">Vul een geldig e-mailadres in</p>
                ) : (
                  <p className="text-xs text-[#94A3B8] mt-1.5">Hier sturen we de magic link naartoe</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  <Building2 className="w-3 h-3" /> Organisatie
                  <span className="font-normal text-[#CBD5E1] normal-case tracking-normal ml-1">— optioneel</span>
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Acme B.V."
                  autoComplete="organization"
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                />
              </div>

              {!isFreeBase && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    <Tag className="w-3 h-3" /> Couponcode
                    <span className="font-normal text-[#CBD5E1] normal-case tracking-normal ml-1">— optioneel</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                      placeholder="GRATIS2024"
                      className={`w-full px-4 py-3 pr-10 border rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 text-sm uppercase tracking-widest font-mono transition-colors ${
                        couponResult?.valid
                          ? 'border-[#00E676] bg-[#F0FDF4] focus:ring-[#00E676]/30'
                          : couponResult && !couponResult.valid
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-[#E2E8F0] focus:ring-[#00E676]/30 focus:border-[#00E676]'
                      }`}
                    />
                    {couponLoading && (
                      <Loader2 className="absolute right-3 top-3.5 w-4 h-4 text-[#94A3B8] animate-spin pointer-events-none" />
                    )}
                    {!couponLoading && couponResult?.valid && (
                      <CheckCircle2 className="absolute right-3 top-3.5 w-4 h-4 text-[#00C853] pointer-events-none" />
                    )}
                    {!couponLoading && couponResult && !couponResult.valid && (
                      <AlertCircle className="absolute right-3 top-3.5 w-4 h-4 text-red-400 pointer-events-none" />
                    )}
                  </div>
                  {couponResult?.valid && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#00C853] bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl px-3 py-2">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>{couponResult.discountLabel}</strong> korting toegepast!</span>
                    </div>
                  )}
                  {couponResult && !couponResult.valid && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {couponResult.error}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!step2Valid}
              className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-base hover:bg-[#00C853] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Naar betaling <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* ── STAP 3: Bevestigen + betalen ──────────────────────────────────────── */}
        {step === 3 && (
          <>
            <div>
              <h2
                className="text-2xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {isFree ? 'Reservering bevestigen' : 'Afrekenen'}
              </h2>
              <p className="text-[#94A3B8] text-sm mt-1">Controleer je boeking en bevestig.</p>
            </div>

            <div className="bg-[#0F172A] rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#00E676] to-[#00C853]" />
              <div className="p-5 space-y-2.5">
                <p className="text-[#00E676] text-xs font-bold uppercase tracking-wider mb-1">Jouw boeking</p>
                {[
                  { label: 'Tocht', value: tour.name },
                  { label: 'Type', value: VARIANT_LABELS[tour.variant] ?? tour.variant },
                  ...(scheduledDate
                    ? [{
                        label: 'Datum',
                        value: new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString('nl-NL', {
                          weekday: 'short', day: 'numeric', month: 'long',
                        }) + ` · ${scheduledTime}`,
                      }]
                    : []),
                  { label: 'Teams', value: `${teamCount} teams` },
                  ...(isPerPerson ? [{ label: 'Deelnemers', value: `${participantCount} personen` }] : []),
                  { label: 'Naam', value: `${firstName} ${lastName}` },
                  { label: 'E-mail', value: email },
                  ...(organizationName ? [{ label: 'Organisatie', value: organizationName }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4 text-sm">
                    <span className="text-[#64748B]">{label}</span>
                    <span className="text-white font-medium text-right">{value}</span>
                  </div>
                ))}

                <div className="border-t border-[#1E293B] pt-3 mt-1">
                  {couponResult?.valid && (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#64748B]">Subtotaal</span>
                        <span className="text-[#94A3B8] line-through">{formatEur(originalAmountCents)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#00E676]">Korting ({couponResult.discountLabel})</span>
                        <span className="text-[#00E676]">−{formatEur(couponResult.discountCents ?? 0)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#CBD5E1] text-sm font-semibold">Totaal excl. BTW</span>
                    <span
                      className="text-white font-black text-3xl"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                    >
                      {isFree ? 'Gratis' : formatEur(finalAmountCents)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { Icon: Lock, text: 'SSL beveiligd' },
                { Icon: Shield, text: 'AVG-compliant' },
                { Icon: Star, text: 'Gratis annuleren' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-[#E2E8F0] text-center">
                  <Icon className="w-4 h-4 text-[#00C853]" />
                  <span className="text-[10px] text-[#64748B] font-medium leading-tight">{text}</span>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-5 bg-[#00E676] text-[#0F172A] rounded-xl font-black uppercase tracking-wide hover:bg-[#00C853] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#00E676]/25"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Even geduld...</>
              ) : isFree ? (
                <><CheckCircle2 className="w-5 h-5" /> Gratis reserveren</>
              ) : (
                <><Lock className="w-4 h-4" /> Veilig betalen — {formatEur(finalAmountCents)}</>
              )}
            </button>

            {!isFree && (
              <div className="flex justify-center gap-2 flex-wrap">
                {['iDEAL', 'Bancontact', 'Visa', 'Mastercard'].map((m) => (
                  <span key={m} className="text-xs px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[#64748B] font-medium">
                    {m}
                  </span>
                ))}
              </div>
            )}

            <p className="text-center text-xs text-[#CBD5E1]">
              Door te boeken ga je akkoord met onze{' '}
              <Link href="/voorwaarden" className="text-[#00E676] hover:underline">algemene voorwaarden</Link>
              {' '}en{' '}
              <Link href="/privacy" className="text-[#00E676] hover:underline">privacybeleid</Link>.
            </p>
          </>
        )}
      </div>

      {/* ── Sticky prijsbalk onderaan ──────────────────────────────────────────── */}
      {!isFreeBase && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#E2E8F0] px-4 py-3 z-20 shadow-lg">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#94A3B8]">
                {isPerPerson
                  ? `${participantCount} deeln. × ${formatEur(tour.pricePerPersonCents)}`
                  : 'Vaste groepsprijs'}
              </p>
              <div className="flex items-baseline gap-2">
                {couponResult?.valid && (
                  <span className="text-sm text-[#94A3B8] line-through">{formatEur(originalAmountCents)}</span>
                )}
                <span
                  className="text-xl font-black text-[#0F172A]"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {isFree ? 'Gratis' : formatEur(finalAmountCents)}
                </span>
                {couponResult?.valid && (
                  <span className="text-xs text-[#00C853] font-bold">−{couponResult.discountLabel}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94A3B8]">excl. BTW</p>
              <div className="flex items-center gap-1 text-xs text-[#64748B]">
                <Lock className="w-3 h-3" />
                Stripe
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
