'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Users, User, Mail, Building2,
  Tag, ArrowRight, ArrowLeft, CheckCircle2,
  Clock, AlertCircle, Loader2, Zap
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

function formatEur(cents: number) {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

export default function BookingWizard({ tour }: { tour: Tour }) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Stap 1: datum + teams
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('14:00')
  const [teamCount, setTeamCount] = useState(4)
  const [participantCount, setParticipantCount] = useState(20)

  // Stap 2: gegevens
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const isFreeBase = tour.priceInCents === 0 && tour.pricingModel === 'flat'
  const isPerPerson = tour.pricingModel === 'per_person'

  // Prijs berekening
  const originalAmountCents = isPerPerson
    ? tour.pricePerPersonCents * participantCount
    : tour.priceInCents

  const finalAmountCents = couponResult?.valid
    ? (couponResult.finalAmountCents ?? originalAmountCents)
    : originalAmountCents

  const isFree = isFreeBase || (couponResult?.valid && couponResult.isFree)

  // Coupon valideren (debounced)
  useEffect(() => {
    if (couponCode.length < 3) {
      setCouponResult(null)
      return
    }
    const timer = setTimeout(async () => {
      setCouponLoading(true)
      try {
        const res = await fetch('/api/marketplace/coupon/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponCode,
            tourId: tour.id,
            originalAmountCents,
          }),
        })
        const data = await res.json()
        setCouponResult(data)
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
          tourId: tour.id,
          scheduledAt,
          participantCount: isPerPerson ? participantCount : undefined,
          teamCount,
          firstName,
          lastName,
          email,
          organizationName: organizationName || undefined,
          couponCode: couponResult?.valid ? couponCode : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Er ging iets mis. Probeer het opnieuw.')
        return
      }

      if (data.free) {
        setDone(true)
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      }
    } catch {
      setSubmitError('Verbindingsfout. Controleer je internet en probeer opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Succes scherm ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#00C853]" />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
              TOCHT GERESERVEERD!
            </h2>
            <p className="text-[#64748B] mb-6 leading-relaxed">
              Check je e-mail op <strong className="text-[#0F172A]">{email}</strong> — we hebben je een link gestuurd om je tocht in te richten.
            </p>
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-[#166534] mb-2">Wat nu?</p>
              <ol className="text-sm text-[#374151] space-y-1.5 list-decimal list-inside">
                <li>Klik op de link in je e-mail</li>
                <li>Geef je sessie een naam</li>
                <li>Maak teams aan</li>
                <li>Start de tocht op de dag zelf!</li>
              </ol>
            </div>
            <p className="text-xs text-[#94A3B8]">Geen e-mail? Check je spam map.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="bg-[#0F172A] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.push(`/tochten/${tour.id}`)}
            className="flex items-center gap-2 text-[#64748B] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {step > 1 ? 'Vorige stap' : 'Terug'}
          </button>
          <div className="text-[#CBD5E1] text-sm font-medium truncate max-w-[200px]">{tour.name}</div>
          <div className="text-[#64748B] text-xs">Stap {step} / 3</div>
        </div>
      </div>

      {/* Stap indicator */}
      <div className="bg-[#0F172A] pb-6">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center gap-0">
            {[
              { n: 1, label: 'Datum & teams' },
              { n: 2, label: 'Jouw gegevens' },
              { n: 3, label: 'Betalen' },
            ].map(({ n, label }, i, arr) => (
              <div key={n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step > n ? 'bg-[#00E676] text-[#0F172A]' :
                    step === n ? 'bg-[#00E676] text-[#0F172A]' :
                    'bg-[#1E293B] text-[#475569]'
                  }`}>
                    {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                    step >= n ? 'text-[#CBD5E1]' : 'text-[#475569]'
                  }`}>{label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${step > n ? 'bg-[#00E676]' : 'bg-[#1E293B]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* ── STAP 1: Datum & teams ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] mb-1"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                WANNEER EN HOEVEEL?
              </h2>
              <p className="text-[#94A3B8] text-sm">Plan je tocht en geef aan hoeveel teams er meedoen.</p>
            </div>

            {/* Tocht preview kaart */}
            <div className="bg-[#0F172A] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#00E676]/10 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-[#00E676]" />
              </div>
              <div>
                <div className="text-[#00E676] text-xs font-bold uppercase tracking-wider">
                  {VARIANT_LABELS[tour.variant] ?? tour.variant}
                </div>
                <div className="text-white font-bold">{tour.name}</div>
                <div className="text-[#64748B] text-xs flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {tour.estimatedDurationMin} min · max {tour.maxTeams} teams
                </div>
              </div>
            </div>

            {/* Datum */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Datum (optioneel)
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
                  className="w-28 px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                />
              </div>
            </div>

            {/* Aantal teams */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Aantal teams
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTeamCount(Math.max(1, teamCount - 1))}
                  className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] hover:text-[#0F172A] transition-colors font-bold text-lg"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-black text-[#0F172A]"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                    {teamCount}
                  </div>
                  <div className="text-xs text-[#94A3B8]">teams (max {tour.maxTeams})</div>
                </div>
                <button
                  type="button"
                  onClick={() => setTeamCount(Math.min(tour.maxTeams, teamCount + 1))}
                  className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] hover:text-[#0F172A] transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
              <input
                type="range"
                min={1}
                max={tour.maxTeams}
                value={teamCount}
                onChange={(e) => setTeamCount(Number(e.target.value))}
                className="w-full mt-4 accent-[#00E676]"
              />
            </div>

            {/* Deelnemers (alleen bij per_person pricing) */}
            {isPerPerson && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Totaal aantal deelnemers
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                    className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] transition-colors font-bold text-lg"
                  >−</button>
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-black text-[#0F172A]"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      {participantCount}
                    </div>
                    <div className="text-xs text-[#94A3B8]">
                      × {formatEur(tour.pricePerPersonCents)} = <strong>{formatEur(originalAmountCents)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParticipantCount(Math.min(500, participantCount + 1))}
                    className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#00E676] transition-colors font-bold text-lg"
                  >+</button>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#00C853] transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Volgende stap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STAP 2: Jouw gegevens ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] mb-1"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                JOUW GEGEVENS
              </h2>
              <p className="text-[#94A3B8] text-sm">We sturen de inloglink naar je e-mailadres.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
              {/* Naam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Voornaam *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jan"
                    required
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Achternaam *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Jansen"
                    required
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> E-mailadres *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan@bedrijf.nl"
                  required
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                />
                <p className="text-xs text-[#94A3B8] mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#00C853]" />
                  Je ontvangt hier je inloglink na boeking
                </p>
              </div>

              {/* Organisatie */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Organisatie (optioneel)
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Acme B.V."
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                />
              </div>

              {/* Couponcode */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Couponcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="GRATIS2024"
                    className={`w-full px-4 py-3 border rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 text-sm uppercase tracking-widest font-mono ${
                      couponResult?.valid
                        ? 'border-[#00E676] focus:ring-[#00E676]/30 bg-[#F0FDF4]'
                        : couponResult && !couponResult.valid
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-[#E2E8F0] focus:ring-[#00E676]/30'
                    }`}
                  />
                  {couponLoading && (
                    <Loader2 className="absolute right-3 top-3.5 w-4 h-4 text-[#94A3B8] animate-spin" />
                  )}
                </div>

                {couponResult && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${couponResult.valid ? 'text-[#00C853]' : 'text-red-500'}`}>
                    {couponResult.valid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span><strong>{couponResult.discountLabel}</strong> toegepast!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{couponResult.error}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!firstName || !lastName || !email}
              className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#00C853] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Naar betaling
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STAP 3: Samenvatting + betalen ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] mb-1"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                {isFree ? 'GRATIS RESERVEREN' : 'AFREKENEN'}
              </h2>
              <p className="text-[#94A3B8] text-sm">Controleer je boeking en bevestig.</p>
            </div>

            {/* Samenvatting */}
            <div className="bg-[#0F172A] rounded-2xl p-5 space-y-3">
              <h3 className="text-[#00E676] text-xs font-bold uppercase tracking-wider">Jouw boeking</h3>

              <div className="space-y-2 text-sm">
                {[
                  { label: 'Tocht', value: tour.name },
                  { label: 'Type', value: VARIANT_LABELS[tour.variant] ?? tour.variant },
                  ...(scheduledDate ? [{ label: 'Datum', value: `${scheduledDate} om ${scheduledTime}` }] : []),
                  { label: 'Teams', value: `${teamCount} teams` },
                  ...(isPerPerson ? [{ label: 'Deelnemers', value: `${participantCount} personen` }] : []),
                  { label: 'Naam', value: `${firstName} ${lastName}` },
                  { label: 'E-mail', value: email },
                  ...(organizationName ? [{ label: 'Organisatie', value: organizationName }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-[#64748B]">{label}</span>
                    <span className="text-white font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#1E293B] pt-3 mt-3">
                {couponResult?.valid && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#64748B]">Subtotaal</span>
                    <span className="text-[#94A3B8] line-through">{formatEur(originalAmountCents)}</span>
                  </div>
                )}
                {couponResult?.valid && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#00E676]">Korting ({couponResult.discountLabel})</span>
                    <span className="text-[#00E676]">−{formatEur(couponResult.discountCents ?? 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#CBD5E1] font-semibold">Totaal</span>
                  <span className="text-white font-black text-xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                    {isFree ? 'GRATIS' : formatEur(finalAmountCents)}
                  </span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            {/* Betaalknop */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-5 bg-[#00E676] text-[#0F172A] rounded-xl font-black uppercase tracking-wide hover:bg-[#00C853] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Even geduld...</>
              ) : isFree ? (
                <><CheckCircle2 className="w-5 h-5" /> Gratis reserveren</>
              ) : (
                <><ArrowRight className="w-5 h-5" /> Betalen via iDEAL / Bancontact</>
              )}
            </button>

            {!isFree && (
              <div className="text-center">
                <p className="text-xs text-[#94A3B8]">
                  Je wordt doorgestuurd naar MultiSafepay voor veilig betalen.
                </p>
                <div className="flex justify-center gap-3 mt-3 flex-wrap">
                  {['iDEAL', 'Bancontact', 'Visa', 'Mastercard'].map((m) => (
                    <span key={m} className="text-xs px-3 py-1 bg-white border border-[#E2E8F0] rounded-lg text-[#64748B] font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-[#CBD5E1]">
              Door te boeken ga je akkoord met onze{' '}
              <Link href="/voorwaarden" className="text-[#00E676] hover:underline">algemene voorwaarden</Link>
              {' '}en{' '}
              <Link href="/privacy" className="text-[#00E676] hover:underline">privacybeleid</Link>.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
