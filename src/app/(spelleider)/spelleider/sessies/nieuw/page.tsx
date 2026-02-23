'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface TourInfo {
  name: string
  variant: string
  pricingModel: string
  priceInCents: number
  pricePerPersonCents: number
}

function NieuweSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tourId = searchParams.get('tourId')

  const [scheduledAt, setScheduledAt] = useState('')
  const [participantCount, setParticipantCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [tourInfo, setTourInfo] = useState<TourInfo | null>(null)
  const [error, setError] = useState('')

  // Laad tour info om te weten of per-persoon pricing actief is
  useEffect(() => {
    if (!tourId) return
    fetch(`/api/tours/${tourId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setTourInfo(data)
      })
      .catch(() => {})
  }, [tourId])

  const isPerPerson = tourInfo?.pricingModel === 'per_person' && (tourInfo?.pricePerPersonCents ?? 0) > 0
  const totalPrice = isPerPerson
    ? ((tourInfo!.pricePerPersonCents * participantCount) / 100).toFixed(2)
    : ((tourInfo?.priceInCents ?? 0) / 100).toFixed(2)
  const isFree = isPerPerson
    ? tourInfo!.pricePerPersonCents === 0
    : (tourInfo?.priceInCents ?? 0) === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tourId) return

    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          scheduledAt: scheduledAt || undefined,
          participantCount: isPerPerson ? participantCount : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Kon sessie niet aanmaken')
        return
      }

      if (data.checkoutUrl) {
        // Betaalde tocht: redirect naar Stripe
        window.location.href = data.checkoutUrl
      } else {
        // Gratis tocht: direct naar sessie dashboard
        router.push(`/spelleider/sessies/${data.sessionId}`)
      }
    } catch {
      setError('Verbindingsfout. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!tourId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Geen tocht geselecteerd.</p>
        <Link href="/spelleider/tochten" className="text-green-600 hover:underline mt-2 inline-block">
          Kies een tocht
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/spelleider/tochten" className="text-gray-400 hover:text-gray-600">
          ← Terug
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nieuwe sessie aanmaken</h1>
      </div>

      {tourInfo && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4 text-sm text-gray-600">
          <span className="font-medium">{tourInfo.name}</span>
          <span className="ml-2 text-gray-400">({tourInfo.variant})</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gepland tijdstip (optioneel)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Laat leeg voor een sessie zonder vastgesteld tijdstip.
            </p>
          </div>

          {/* Deelnemersaantal voor per-persoon pricing (bijv. VoetbalMissie) */}
          {isPerPerson && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aantal deelnemers
              </label>
              <input
                type="number"
                value={participantCount}
                onChange={(e) => setParticipantCount(Math.max(1, Number(e.target.value)))}
                min={1}
                max={200}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {participantCount} × €{(tourInfo!.pricePerPersonCents / 100).toFixed(2)} = <strong>€{totalPrice} totaal</strong>
              </p>
            </div>
          )}

          {/* Prijsoverzicht */}
          {tourInfo && !isFree && (
            <div className="bg-green-50 rounded-lg px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Te betalen:</span>
                <span className="font-bold text-green-700">€{totalPrice}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Via Stripe Checkout</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Aanmaken...' : isFree ? 'Sessie aanmaken' : `Betalen & aanmaken — €${totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NieuweSessionPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="p-6 text-gray-400">Laden...</div>}>
        <NieuweSessionContent />
      </Suspense>
    </main>
  )
}
