'use client'

import { useEffect, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Heart, Lightbulb, Smile, TrendingUp, ArrowUpRight, RefreshCw } from 'lucide-react'
import { MobileShell } from '@/components/layout/mobile-shell'
import { PageHeader } from '@/components/layout/page-header'
import { BottomNav } from '@/components/ui/bottom-nav'
import { RadialProgress } from '@/components/ui/radial-progress'
import { MiniBarChart } from '@/components/ui/mini-bar-chart'

interface RapportData {
  teamName: string
  tourName: string
  totalGmsScore: number
  gmsMax: number
  rank: number
  totalTeams: number
  dimensions: {
    connection: number
    meaning: number
    joy: number
    growth: number
  }
  dimensionMaxes: {
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
  checkpointScores: { name: string; gmsEarned: number }[]
  coachInsight: string
}

export default function RapportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RapportData | null>(null)

  const load = useCallback(async () => {
    const teamToken = sessionStorage.getItem('teamToken')
    if (!teamToken) {
      router.replace('/join')
      return
    }

    setError(null)
    try {
      const res = await fetch(`/api/game/rapport/${sessionId}`, {
        headers: { 'x-team-token': teamToken },
      })
      if (!res.ok) {
        if (res.status === 401) { router.replace('/join'); return }
        throw new Error(`HTTP ${res.status}`)
      }
      const json: RapportData = await res.json()
      setData(json)
    } catch {
      setError('Kan rapport niet laden. Controleer je verbinding.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, router])

  useEffect(() => { load() }, [load])

  if (isLoading) {
    return (
      <MobileShell className="bg-[#F0FDF4]">
        <PageHeader title="Impact Rapport" subtitle="Laden..." className="bg-[#F0FDF4] border-[#DCFCE7]" />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {/* Radial skeleton */}
          <div className="flex flex-col items-center py-4">
            <div
              className="animate-pulse rounded-full bg-gray-200"
              style={{ width: 180, height: 180 }}
            />
          </div>
          {/* Dimension cards skeleton */}
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
          {/* Chart skeleton */}
          <div className="bg-gray-100 rounded-xl h-28 animate-pulse" />
          {/* Coach insight skeleton */}
          <div className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
        </div>
        <BottomNav activeTab="impact" variant="simple" />
      </MobileShell>
    )
  }

  if (error || !data) {
    return (
      <MobileShell className="bg-[#F0FDF4]">
        <PageHeader title="Impact Rapport" className="bg-[#F0FDF4] border-[#DCFCE7]" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-[#64748B] text-sm text-center">{error ?? 'Onbekende fout'}</p>
          <button
            onClick={() => { setIsLoading(true); load() }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00E676] text-[#0F172A] rounded-xl font-semibold text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Opnieuw proberen
          </button>
        </div>
        <BottomNav activeTab="impact" variant="simple" />
      </MobileShell>
    )
  }

  const { teamName, totalGmsScore, gmsMax, dimensions, dimensionPercentages, checkpointScores, coachInsight } = data

  // Normaliseer GMS score naar percentage van 100 voor de radial
  const gmsPercentage = gmsMax > 0 ? Math.round((totalGmsScore / gmsMax) * 100) : 0
  const isHighImpact = gmsPercentage >= 70

  const qualitative = (pct: number) => pct >= 70 ? 'Hoog' : pct >= 40 ? 'Gemiddeld' : 'Laag'

  const dimensionCards = [
    { label: 'Verbinding', icon: Heart, value: dimensions.connection, color: '#EC4899', qualitative: qualitative(dimensionPercentages.connection) },
    { label: 'Betekenis', icon: Lightbulb, value: dimensions.meaning, color: '#8B5CF6', qualitative: qualitative(dimensionPercentages.meaning) },
    { label: 'Plezier', icon: Smile, value: dimensions.joy, color: '#F59E0B', qualitative: qualitative(dimensionPercentages.joy) },
    { label: 'Groei', icon: TrendingUp, value: dimensions.growth, color: '#00E676', qualitative: qualitative(dimensionPercentages.growth) },
  ]

  // Bar chart data: per checkpoint GMS earned
  const chartData = checkpointScores.map((cp, i) => ({
    day: `CP${i + 1}`,
    value: cp.gmsEarned,
    isCurrent: i === checkpointScores.length - 1,
  }))

  return (
    <MobileShell className="bg-[#F0FDF4]">
      <PageHeader
        title="Impact Rapport"
        subtitle={teamName}
        className="bg-[#F0FDF4] border-[#DCFCE7]"
      />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Radiale score */}
        <div className="animate-scale-in stagger-1 flex flex-col items-center py-4">
          <RadialProgress
            value={gmsPercentage}
            max={100}
            size={180}
            label="GMS Score"
            sublabel={`${totalGmsScore} / ${gmsMax} punten`}
          />
          {isHighImpact && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#DCFCE7] border border-[#00E676]/30 rounded-full px-4 py-1.5">
              <Star className="w-3.5 h-3.5 text-[#00C853]" fill="#00C853" />
              <span className="text-xs font-bold text-[#00C853]">Hoge Impact Badge</span>
            </div>
          )}
          <p className="text-sm text-[#64748B] text-center mt-3 max-w-[280px]">
            De Geluksmomenten Score meet verbinding, betekenis, plezier en groei — elk goed voor 25 punten.
          </p>
        </div>

        {/* Impact Breakdown 2×2 */}
        <div className="animate-slide-up-fade stagger-2">
          <h2
            className="text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            IMPACT BREAKDOWN
          </h2>
          <p className="text-xs text-[#94A3B8] mb-3">Elke dimensie is max 25 punten</p>
          <div className="grid grid-cols-2 gap-3">
            {dimensionCards.map((dim, i) => (
              <div
                key={dim.label}
                className={`animate-scale-in stagger-${Math.min(i + 2, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8} bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 card-pressable`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${dim.color}20` }}
                  >
                    <dim.icon className="w-3.5 h-3.5" style={{ color: dim.color }} />
                  </div>
                  <span className="text-xs font-medium text-[#64748B]">{dim.label}</span>
                </div>
                <div
                  className="text-3xl font-extrabold leading-none mb-2"
                  style={{
                    fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
                    color: dim.color,
                  }}
                >
                  {dim.value}
                </div>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: dim.color }} />
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: dim.color, backgroundColor: `${dim.color}15` }}
                  >
                    {dim.qualitative}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkpoint GMS grafiek */}
        {chartData.length > 0 && (
          <div className="animate-slide-up-fade stagger-6 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">GMS per Checkpoint</h2>
            <MiniBarChart data={chartData} />
            <p className="text-xs text-[#64748B] mt-2">Verdiende GMS punten per voltooide missie</p>
          </div>
        )}

        {/* Coach Inzicht — wit */}
        <div className="animate-slide-up-fade stagger-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] border border-[#00E676]/30 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-[#00C853]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#00C853] uppercase tracking-wider mb-1">
                Coach Inzicht
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">{coachInsight}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(`/game/${sessionId}/voltooid`)}
          className="animate-slide-up-fade stagger-8 w-full py-4 rounded-2xl bg-[#00E676] text-[#0F172A] font-semibold text-sm active:scale-[0.97] active:bg-[#00C853] transition-all duration-150 shadow-md shadow-[#00E676]/30"
        >
          Terug naar Overzicht
        </button>

        <div className="h-4" />
      </div>

      <BottomNav activeTab="impact" variant="simple" />
    </MobileShell>
  )
}
