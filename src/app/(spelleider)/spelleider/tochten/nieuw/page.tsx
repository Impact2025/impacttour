'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Variant = 'wijktocht' | 'impactsprint' | 'familietocht' | 'jeugdtocht' | 'voetbalmissie'

const VARIANTS: { value: Variant; label: string; description: string }[] = [
  {
    value: 'wijktocht',
    label: 'WijkTocht',
    description: 'Standaard bedrijven, GPS checkpoints + sociale opdrachten',
  },
  {
    value: 'impactsprint',
    label: 'ImpactSprint',
    description: 'Compact, 5 checkpoints, 500m radius, max 90 minuten',
  },
  {
    value: 'familietocht',
    label: 'FamilieTocht',
    description: 'Gezinnen, weekenden, Familie Geluksscore',
  },
  {
    value: 'jeugdtocht',
    label: 'JeugdTocht',
    description: '9-13 jaar, Flits-assistent, geofencing, strikte privacy',
  },
  {
    value: 'voetbalmissie',
    label: 'VoetbalMissie',
    description: '9-12 jaar, voetbal-thema, 5 checkpoints, 90 min, €6/kind',
  },
]

const KIDS_VARIANTS: Variant[] = ['jeugdtocht', 'voetbalmissie']

function NieuweTochtContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAI = searchParams.get('ai') === '1'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Formulier state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [variant, setVariant] = useState<Variant>('wijktocht')
  const [durationMin, setDurationMin] = useState(120)
  const [maxTeams, setMaxTeams] = useState(20)
  const [priceEur, setPriceEur] = useState('0')
  const [pricingModel, setPricingModel] = useState<'flat' | 'per_person'>('flat')
  const [pricePerPersonEur, setPricePerPersonEur] = useState('6')

  // AI generator state
  const [aiLocation, setAiLocation] = useState('')
  const [aiThemes, setAiThemes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          variant,
          estimatedDurationMin: durationMin,
          maxTeams,
          priceInCents: Math.round(parseFloat(priceEur) * 100),
          pricingModel: KIDS_VARIANTS.includes(variant) ? pricingModel : 'flat',
          pricePerPersonCents: pricingModel === 'per_person'
            ? Math.round(parseFloat(pricePerPersonEur) * 100)
            : 0,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fout bij aanmaken tocht')
        return
      }

      router.push(`/spelleider/tochten/${data.id}`)
    } catch {
      setError('Verbindingsfout. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!name || !aiLocation) {
      setError('Vul naam en locatie in voor de AI generator')
      return
    }
    setError('')
    setIsGenerating(true)

    try {
      const res = await fetch('/api/ai/generate-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          variant,
          location: aiLocation,
          teamSize: variant === 'voetbalmissie' ? 5 : 8,
          durationMinutes: durationMin,
          themes: aiThemes ? aiThemes.split(',').map((t) => t.trim()) : [],
          checkpointCount: variant === 'voetbalmissie' ? 5 : undefined,
          pricingModel: KIDS_VARIANTS.includes(variant) ? pricingModel : 'flat',
          pricePerPersonCents: pricingModel === 'per_person'
            ? Math.round(parseFloat(pricePerPersonEur) * 100)
            : 0,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'AI generatie mislukt')
        return
      }

      // Navigeer naar de aangemakte tocht
      router.push(`/spelleider/tochten/${data.tourId}?generated=1`)
    } catch {
      setError('AI generatie mislukt. Probeer het opnieuw.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/spelleider/tochten" className="text-gray-400 hover:text-gray-600">
            ← Terug
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAI ? 'AI Tocht Generator' : 'Nieuwe tocht aanmaken'}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Variant keuze */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tocht variant
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VARIANTS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setVariant(v.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    variant === v.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">{v.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{v.description}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Naam */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam van de tocht <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="bijv. Stadsontdekking Amsterdam"
                required
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Beschrijving */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Korte beschrijving van de tocht..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Duur + Max teams */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geschatte duur (minuten)
                </label>
                <input
                  type="number"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  min={30}
                  max={480}
                  step={15}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max. aantal teams
                </label>
                <input
                  type="number"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* VoetbalMissie info banner */}
            {variant === 'voetbalmissie' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
                <p className="font-semibold text-green-800 text-sm">VoetbalMissie instellingen</p>
                <ul className="text-xs text-green-700 space-y-0.5">
                  <li>• 5 checkpoints, 90 minuten actief + 15 min opwarming</li>
                  <li>• JeugdTocht beveiliging (geen chat, geofencing, foto cleanup)</li>
                  <li>• Groepen van 8-24 kinderen (2-4 teams van 4-5)</li>
                  <li>• Verplicht: 1 begeleider per 4 kinderen</li>
                </ul>
              </div>
            )}

            {/* Prijs */}
            <div>
              {KIDS_VARIANTS.includes(variant) && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prijsmodel</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPricingModel('flat')}
                      className={`flex-1 py-2 text-sm rounded-lg border-2 transition-colors ${
                        pricingModel === 'flat' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      Vaste prijs per sessie
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingModel('per_person')}
                      className={`flex-1 py-2 text-sm rounded-lg border-2 transition-colors ${
                        pricingModel === 'per_person' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      Per kind (€/kind)
                    </button>
                  </div>
                </div>
              )}
              {pricingModel === 'per_person' && KIDS_VARIANTS.includes(variant) ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prijs per kind (€)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    <input
                      type="number"
                      value={pricePerPersonEur}
                      onChange={(e) => setPricePerPersonEur(e.target.value)}
                      min="0"
                      step="0.50"
                      placeholder="6.00"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Schooltarief: €6/kind — Groepstarief: €65 voor 10 kinderen</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prijs per sessie (€)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    <input
                      type="number"
                      value={priceEur}
                      onChange={(e) => setPriceEur(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Vul 0 in voor gratis tochten</p>
                </div>
              )}
            </div>

            {/* AI Generator velden */}
            {isAI && (
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium text-gray-700">AI Generator instellingen</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locatie / stad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={aiLocation}
                    onChange={(e) => setAiLocation(e.target.value)}
                    placeholder="bijv. Amsterdam Centrum"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thema&apos;s (komma-gescheiden, optioneel)
                  </label>
                  <input
                    type="text"
                    value={aiThemes}
                    onChange={(e) => setAiThemes(e.target.value)}
                    placeholder="bijv. duurzaamheid, diversiteit, innovatie"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              {isAI ? (
                <>
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !name || !aiLocation}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? 'AI genereert tocht...' : 'Genereer tocht met AI'}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !name}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
                  >
                    Zonder AI
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !name}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Aanmaken...' : 'Tocht aanmaken'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function NieuweTochtPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Laden...</div>}>
      <NieuweTochtContent />
    </Suspense>
  )
}
