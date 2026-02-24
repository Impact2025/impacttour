'use client'

import { useEffect, useCallback, useState } from 'react'
import { Sparkles, Heart, Lightbulb, Smile, TrendingUp, RefreshCw } from 'lucide-react'
import { AnimatedNumber } from '@/components/game/animated-number'

interface RapportData {
  teamName: string
  totalGmsScore: number
  gmsMax: number
  dimensions: {
    connection: number
    meaning: number
    joy: number
    growth: number
  }
  dimensionPercentages: {
    connection: number
    meaning: number
    joy: number
    growth: number
  }
  coachInsight: string
}

interface Props {
  sessionId: string
  teamToken: string
}

const dimensionConfig = [
  { key: 'connection' as const, label: 'Verbinding', Icon: Heart, color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'meaning' as const, label: 'Betekenis', Icon: Lightbulb, color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'joy' as const, label: 'Plezier', Icon: Smile, color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'growth' as const, label: 'Groei', Icon: TrendingUp, color: '#00C853', bg: '#F0FDF4' },
]

export function ImpactPanel({ sessionId, teamToken }: Props) {
  const [data, setData] = useState<RapportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(`/api/game/rapport/${sessionId}`, {
        headers: { 'x-team-token': teamToken },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch {
      setError('Kan impact data niet laden')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, teamToken])

  useEffect(() => { load() }, [load])

  const isHighImpact = (data?.totalGmsScore ?? 0) >= 70
  const pct = Math.min(100, data?.totalGmsScore ?? 0)

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="px-4 py-4 space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between pt-1 pb-0.5">
          <h2 className="text-lg font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-display)' }}>
            Impact
          </h2>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            LIVE
          </span>
        </div>

        {isLoading ? (
          <>
            <div className="h-44 bg-[#0F172A] rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          </>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-[#64748B]">{error}</p>
            <button
              onClick={() => { setIsLoading(true); load() }}
              className="flex items-center gap-2 px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              <RefreshCw className="w-4 h-4" />
              Opnieuw
            </button>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Sparkles className="w-8 h-8 text-[#CBD5E1]" />
            <p className="text-sm text-[#64748B]">Impact data beschikbaar na je eerste missie</p>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div className="bg-[#0F172A] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00E676] to-[#00C853] rounded-t-2xl" />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Jullie impact score</p>
                  <p className="text-sm font-semibold text-[#94A3B8] mt-0.5">{data.teamName}</p>
                </div>
                {isHighImpact && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-[#0F172A] bg-[#00E676] px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0">
                    <Sparkles className="w-3 h-3" />
                    IMPACT MAKER
                  </span>
                )}
              </div>
              <div className="text-center py-1">
                <p
                  className="font-black text-[#00E676] leading-none"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '64px' }}
                >
                  <AnimatedNumber value={data.totalGmsScore} duration={800} />
                </p>
                <p className="text-xs text-[#64748B] mt-1">van 100 GMS punten</p>
              </div>
              <div className="bg-white/10 rounded-full h-2 overflow-hidden mt-4">
                <div
                  className="bg-[#00E676] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* 4 Dimensies */}
            <div className="grid grid-cols-2 gap-2">
              {dimensionConfig.map(({ key, label, Icon, color, bg }) => {
                const score = data.dimensions[key]
                const pctDim = data.dimensionPercentages[key]
                return (
                  <div
                    key={key}
                    className="rounded-2xl p-4"
                    style={{ backgroundColor: bg, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: color + '22' }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <p className="text-[11px] font-bold text-[#64748B]">{label}</p>
                    </div>
                    <p
                      className="font-black text-[#0F172A] leading-none"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '36px' }}
                    >
                      {score}
                    </p>
                    <div className="bg-black/10 rounded-full h-1.5 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pctDim}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Coach Inzicht */}
            {data.coachInsight && (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
              >
                <div className="px-4 py-3 flex items-center gap-3 border-b border-[#F1F5F9]">
                  <div className="w-10 h-10 rounded-full bg-[#00E676] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#0F172A]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#0F172A] uppercase tracking-wide">Coach Inzicht</p>
                    <p className="text-[10px] text-[#94A3B8]">AI analyse van jullie impact</p>
                  </div>
                </div>
                <div className="px-4 py-4">
                  <p className="text-sm text-[#334155] leading-relaxed">{data.coachInsight}</p>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
