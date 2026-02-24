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

const cardShadow = { boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }

export default function RapportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RapportData | null>(null)

  const load = useCallback(async () => {
    const teamToken = sessionStorage.getItem('teamToken')
    if (!teamToken) { router.replace('/join'); return }

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

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <MobileShell className="bg-[#F0FDF4]">
        <PageHeader title="Impact Rapport" subtitle="Laden..." className="bg-[#F0FDF4] border-[#DCFCE7]" />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex flex-col items-center py-6">
            <div className="animate-pulse rounded-full bg-[#DCFCE7]" style={{ width: 220, height: 220 }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="bg-[#DCFCE7] rounded-2xl h-32 animate-pulse" />)}
          </div>
          <div className="bg-[#DCFCE7] rounded-2xl h-28 animate-pulse" />
          <div className="bg-[#DCFCE7] rounded-2xl h-36 animate-pulse" />
        </div>
        <BottomNav activeTab="impact" variant="simple" />
      </MobileShell>
    )
  }

  /* ── ERROR ── */
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

  const gmsPercentage = gmsMax > 0 ? Math.round((totalGmsScore / gmsMax) * 100) : 0
  const isHighImpact = gmsPercentage >= 70

  const qualitative = (pct: number) => pct >= 70 ? 'Hoog' : pct >= 40 ? 'Gemiddeld' : 'Laag'

  const dimensionCards = [
    { label: 'Verbinding', icon: Heart, value: dimensions.connection, pct: dimensionPercentages.connection, color: '#EC4899' },
    { label: 'Betekenis', icon: Lightbulb, value: dimensions.meaning, pct: dimensionPercentages.meaning, color: '#8B5CF6' },
    { label: 'Plezier', icon: Smile, value: dimensions.joy, pct: dimensionPercentages.joy, color: '#F59E0B' },
    { label: 'Groei', icon: TrendingUp, value: dimensions.growth, pct: dimensionPercentages.growth, color: '#00E676' },
  ]

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

        {/* ── RADIALE SCORE ── */}
        <div className="animate-scale-in stagger-1">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center" style={cardShadow}>
            {/* Radial — groot formaat */}
            <RadialProgress
              value={gmsPercentage}
              max={100}
              size={220}
              label="GMS Score"
              sublabel={`${totalGmsScore} / ${gmsMax} punten`}
            />

            {/* High impact badge */}
            {isHighImpact && (
              <div className="mt-4 inline-flex items-center gap-1.5 bg-[#DCFCE7] border border-[#00E676]/40 rounded-full px-4 py-1.5">
                <Star className="w-3.5 h-3.5 text-[#00C853]" fill="#00C853" />
                <span className="text-xs font-bold text-[#00C853]">Hoge Impact Badge</span>
              </div>
            )}

            <p className="text-sm text-[#64748B] text-center mt-3 leading-relaxed max-w-[260px]">
              De Geluksmomenten Score meet verbinding, betekenis, plezier en groei — elk goed voor 25 punten.
            </p>
          </div>
        </div>

        {/* ── IMPACT BREAKDOWN 2×2 ── */}
        <div className="animate-slide-up-fade stagger-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2
              className="text-xs font-bold text-[#0F172A] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Impact Breakdown
            </h2>
            <p className="text-[10px] text-[#94A3B8]">max 25 pt per dimensie</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {dimensionCards.map((dim, i) => (
              <div
                key={dim.label}
                className={`animate-scale-in stagger-${Math.min(i + 2, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8} bg-white rounded-2xl p-4`}
                style={cardShadow}
              >
                {/* Icon + label */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${dim.color}18` }}
                  >
                    <dim.icon className="w-4 h-4" style={{ color: dim.color }} />
                  </div>
                  <span className="text-xs font-semibold text-[#64748B]">{dim.label}</span>
                </div>

                {/* Score groot */}
                <div
                  className="text-[40px] font-black leading-none mb-2"
                  style={{
                    fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
                    color: dim.color,
                  }}
                >
                  {dim.value}
                </div>

                {/* Kwalitatief label */}
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: dim.color }} />
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: dim.color, backgroundColor: `${dim.color}15` }}
                  >
                    {qualitative(dim.pct)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── GMS PER CHECKPOINT GRAFIEK ── */}
        {chartData.length > 0 && (
          <div
            className="animate-slide-up-fade stagger-6 bg-white rounded-2xl p-5"
            style={cardShadow}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0F172A]">Sociale Groei</h2>
              <span className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide">Per Checkpoint</span>
            </div>
            <MiniBarChart data={chartData} />
            <p className="text-xs text-[#94A3B8] mt-2">Verdiende GMS punten per voltooide missie</p>
          </div>
        )}

        {/* ── COACH INZICHT ── */}
        <div
          className="animate-slide-up-fade stagger-7 bg-white rounded-2xl overflow-hidden"
          style={cardShadow}
        >
          {/* Groene accent balk bovenaan */}
          <div className="h-1 bg-gradient-to-r from-[#00E676] to-[#00C853]" />
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-[#00C853]" fill="#00C853" />
              </div>
              <div className="flex-1">
                <p
                  className="text-[11px] font-bold text-[#00C853] uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  Coach Inzicht
                </p>
                <p className="text-sm text-[#475569] leading-relaxed">{coachInsight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          onClick={() => router.push(`/game/${sessionId}/voltooid`)}
          className="animate-slide-up-fade stagger-8 w-full py-4 rounded-2xl bg-[#00E676] text-[#0F172A] font-black italic text-base active:scale-[0.97] active:bg-[#00C853] transition-all duration-150 uppercase tracking-wide"
          style={{
            fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
            boxShadow: '0 4px 20px rgba(0,230,118,0.30)',
          }}
        >
          Terug naar Overzicht
        </button>

        <div className="h-4" />
      </div>

      <BottomNav activeTab="impact" variant="simple" />
    </MobileShell>
  )
}
