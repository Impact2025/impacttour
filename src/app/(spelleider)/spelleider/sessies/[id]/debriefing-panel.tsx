'use client'

import { useState, useEffect } from 'react'
import { Copy, Sparkles, TrendingUp } from 'lucide-react'

interface Props {
  sessionId: string
}

interface DebriefingResult {
  debriefing: string
  avgScore: number
  gmsBreakdown: {
    connection: number
    meaning: number
    joy: number
    growth: number
  }
}

const DIMS = [
  { key: 'connection' as const, label: 'Verbinding', color: '#3B82F6' },
  { key: 'meaning'    as const, label: 'Betekenis',  color: '#8B5CF6' },
  { key: 'joy'        as const, label: 'Plezier',    color: '#F59E0B' },
  { key: 'growth'     as const, label: 'Groei',      color: '#00E676' },
]

const CACHE_KEY = (id: string) => `debrief-${id}`

export function DebriefingPanel({ sessionId }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult]       = useState<DebriefingResult | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [copied, setCopied]       = useState(false)

  // Herstel gecachte debriefing na navigatie
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY(sessionId))
      if (cached) setResult(JSON.parse(cached))
    } catch {}
  }, [sessionId])

  const generate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/spelleider/sessies/${sessionId}/debriefing`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Genereren mislukt')
      } else {
        setResult(data)
        try { localStorage.setItem(CACHE_KEY(sessionId), JSON.stringify(data)) } catch {}
      }
    } catch {
      setError('Verbindingsfout')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result?.debriefing) return
    navigator.clipboard.writeText(result.debriefing)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setResult(null)
    try { localStorage.removeItem(CACHE_KEY(sessionId)) } catch {}
  }

  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-green-600" />
          <h2 className="font-semibold text-gray-900">AI Debriefing</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Genereer een gepersonaliseerde debriefing van 400–600 woorden op basis van de GMS-scores van alle teams.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          onClick={generate}
          disabled={isLoading}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI schrijft debriefing…
            </span>
          ) : (
            'Genereer AI Debriefing'
          )}
        </button>
      </div>
    )
  }

  // Sorteer dimensies van sterk naar zwak voor de bars
  const sorted = DIMS
    .map((d) => ({ ...d, value: result.gmsBreakdown[d.key], pct: Math.round((result.gmsBreakdown[d.key] / 25) * 100) }))
    .sort((a, b) => b.value - a.value)
  const strongestKey = sorted[0].key
  const weakestKey   = sorted[sorted.length - 1].key

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-green-600" />
          <h2 className="font-semibold text-gray-900">AI Debriefing</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Gekopieerd!' : 'Kopieer'}
          </button>
          <button
            onClick={reset}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ↻ Opnieuw
          </button>
        </div>
      </div>

      {/* Gemiddelde sessiescore */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="text-2xl font-black text-gray-900">
          {result.avgScore}
          <span className="text-sm font-normal text-gray-400">/100</span>
        </div>
        <p className="text-sm text-gray-500">Gemiddelde GMS-score over alle teams</p>
      </div>

      {/* GMS dimension bars */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">GMS Verdeling</p>
        <div className="space-y-3">
          {sorted.map((d) => {
            const isStrongest = d.key === strongestKey
            const isWeakest   = d.key === weakestKey
            const barColor    = isStrongest ? '#00E676' : isWeakest ? '#F59E0B' : d.color
            return (
              <div key={d.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-700">{d.label}</span>
                    {isStrongest && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">⭐ Sterkste</span>
                    )}
                    {isWeakest && (
                      <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                        <TrendingUp className="w-2.5 h-2.5" /> Groeipunt
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-600">{d.value}<span className="font-normal text-gray-400">/25</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.pct}%`, background: barColor, transition: 'width 0.7s ease' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Debriefing tekst */}
      <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-7 whitespace-pre-wrap border-l-4 border-green-400">
        {result.debriefing}
      </div>
    </div>
  )
}
