'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'

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

export function DebriefingPanel({ sessionId }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DebriefingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/spelleider/sessies/${sessionId}/debriefing`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Genereren mislukt')
      } else {
        setResult(data)
      }
    } catch {
      setError('Verbindingsfout')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.debriefing) {
      navigator.clipboard.writeText(result.debriefing)
    }
  }

  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-2">AI Debriefing</h2>
        <p className="text-sm text-gray-500 mb-4">
          Genereer een gepersonaliseerde debriefing van 400-600 woorden op basis van de prestaties van alle teams.
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
              AI schrijft debriefing...
            </span>
          ) : (
            'Genereer AI Debriefing'
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="font-semibold text-gray-900">AI Debriefing</h2>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Copy className="w-3 h-3" /> Kopieer
          </button>
          <button
            onClick={() => setResult(null)}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            ↻ Opnieuw
          </button>
        </div>
      </div>

      {/* GMS samenvatting */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          ['Verbinding', result.gmsBreakdown.connection],
          ['Betekenis', result.gmsBreakdown.meaning],
          ['Plezier', result.gmsBreakdown.joy],
          ['Groei', result.gmsBreakdown.growth],
        ].map(([label, val]) => (
          <div key={label as string} className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-700">{val}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Debriefing tekst */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {result.debriefing}
      </div>
    </div>
  )
}
