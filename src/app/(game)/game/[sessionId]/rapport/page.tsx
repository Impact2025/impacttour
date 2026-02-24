'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, Heart, Lightbulb, Smile, TrendingUp, ArrowUpRight, RefreshCw, FileText, Share2 } from 'lucide-react'
import { MobileShell } from '@/components/layout/mobile-shell'
import { PageHeader } from '@/components/layout/page-header'
import { BottomNav } from '@/components/ui/bottom-nav'
import { RadialProgress } from '@/components/ui/radial-progress'
import { MiniBarChart } from '@/components/ui/mini-bar-chart'
import { AnimatedNumber } from '@/components/game/animated-number'

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

// Typed-letter reveal effect for Coach Insight
function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!text || startedRef.current) return
    const timer = setTimeout(() => {
      startedRef.current = true
      const interval = setInterval(() => {
        indexRef.current += 1
        setDisplayed(text.slice(0, indexRef.current))
        if (indexRef.current >= text.length) clearInterval(interval)
      }, 12)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, delay])

  return <>{displayed || <span className="opacity-0">{text.slice(0, 1)}</span>}</>
}

export default function RapportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RapportData | null>(null)
  const [showScoreCard, setShowScoreCard] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

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

  const handlePdfDownload = async () => {
    const teamToken = sessionStorage.getItem('teamToken')
    if (!teamToken) return
    setPdfLoading(true)
    try {
      const res = await fetch(`/api/pdf/${sessionId}?teamToken=${teamToken}`)
      if (!res.ok) throw new Error('PDF generatie mislukt')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `rapport-${sessionId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent
    } finally {
      setPdfLoading(false)
    }
  }

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

  const { teamName, tourName, totalGmsScore, gmsMax, dimensions, dimensionPercentages, checkpointScores, coachInsight } = data

  const gmsPercentage = gmsMax > 0 ? Math.round((totalGmsScore / gmsMax) * 100) : 0
  const isHighImpact  = gmsPercentage >= 70

  const qualitative = (pct: number) => pct >= 70 ? 'Hoog' : pct >= 40 ? 'Gemiddeld' : 'Laag'

  const dimensionCards = [
    { label: 'Verbinding', icon: Heart,      value: dimensions.connection, pct: dimensionPercentages.connection, color: '#EC4899' },
    { label: 'Betekenis',  icon: Lightbulb,  value: dimensions.meaning,    pct: dimensionPercentages.meaning,    color: '#8B5CF6' },
    { label: 'Plezier',    icon: Smile,      value: dimensions.joy,         pct: dimensionPercentages.joy,        color: '#F59E0B' },
    { label: 'Groei',      icon: TrendingUp, value: dimensions.growth,     pct: dimensionPercentages.growth,     color: '#00E676' },
  ]

  const chartData = checkpointScores.map((cp, i) => ({
    day: `CP${i + 1}`,
    value: cp.gmsEarned,
    isCurrent: i === checkpointScores.length - 1,
  }))

  const stagger = (i: number) => ({
    className: 'animate-fade-up',
    style: { animationDelay: `${i * 0.12}s`, animationFillMode: 'both' as const },
  })

  return (
    <MobileShell className="bg-[#F0FDF4]">
      <PageHeader
        title="Impact Rapport"
        subtitle={teamName}
        className="bg-[#F0FDF4] border-[#DCFCE7]"
      />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        <div {...stagger(0)} className="text-center pt-1">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{tourName}</p>
          <h2
            className="text-2xl font-black text-[#0F172A] mt-1"
            style={{ fontFamily: 'var(--font-display, \"Barlow Condensed\", sans-serif)' }}
          >
            {teamName}
          </h2>
        </div>

        <div {...stagger(1)} className="flex flex-col items-center pt-2 pb-1">
          <RadialProgress
            value={gmsPercentage}
            max={100}
            size={220}
            sublabel="/ 100"
          />

          <h2 className="text-xl font-black text-[#0F172A] mt-4 text-center"
            style={{ fontFamily: 'var(--font-display, \"Barlow Condensed\", sans-serif)' }}>
            Geluksmomenten Score
          </h2>
          <p className="text-sm text-[#64748B] text-center mt-1.5 leading-relaxed max-w-[280px]">
            Jouw team scoorde{" "}
            <AnimatedNumber value={totalGmsScore} duration={1000} className="font-black text-[#0F172A]" />
            {" "}van {gmsMax} punten op verbinding, betekenis, plezier en groei.
          </p>

          {isHighImpact && (
            <div
              className="mt-3 inline-flex items-center gap-1.5 bg-[#DCFCE7] border border-[#00E676]/40 rounded-full px-4 py-1.5 animate-fade-up"
              style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00C853]" />
              <span className="text-xs font-bold text-[#00C853]">Hoge Impact Badge</span>
            </div>
          )}
        </div>

        <div {...stagger(2)}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display, \"Barlow Condensed\", sans-serif)' }}>
              Impact Breakdown
            </h2>
            <p className="text-[10px] text-[#94A3B8]">max 25 pt per dimensie</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {dimensionCards.map((dim, i) => (
              <div
                key={dim.label}
                {...stagger(3 + i)}
                className="bg-white rounded-2xl p-4"
                style={cardShadow}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${dim.color}18` }}>
                    <dim.icon className="w-4 h-4" style={{ color: dim.color }} />
                  </div>
                  <span className="text-xs font-semibold text-[#64748B]">{dim.label}</span>
                </div>

                <div className="text-[40px] font-black leading-none mb-2"
                  style={{ fontFamily: 'var(--font-display, \"Barlow Condensed\", sans-serif)', color: dim.color }}>
                  <AnimatedNumber value={dim.value} duration={900} />
                </div>

                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: dim.color }} />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: dim.color, backgroundColor: `${dim.color}15` }}>
                    {qualitative(dim.pct)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {chartData.length > 0 && (
          <div {...stagger(7)} className="bg-white rounded-2xl p-5" style={cardShadow}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0F172A]">Sociale Groei</h2>
              <span className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide">Per Checkpoint</span>
            </div>
            <MiniBarChart data={chartData} />
            <p className="text-xs text-[#94A3B8] mt-2">Verdiende GMS punten per voltooide missie</p>
          </div>
        )}

        <div {...stagger(8)} className="bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <div className="h-1.5 bg-gradient-to-r from-[#00E676] via-[#00C853] to-[#00E676]" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00E676] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-[#0F172A] mb-2"
                  style={{ fontFamily: 'var(--font-display, \"Barlow Condensed\", sans-serif)' }}>
                  Coach Inzicht
                </p>
                <p className="text-sm text-[#475569] leading-relaxed">
                  <TypedText text={coachInsight} delay={700} />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div {...stagger(9)}>
          <button
            onClick={() => setShowScoreCard((v) => !v)}
            className="w-full py-3 rounded-2xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <Share2 className="w-4 h-4" />
            {showScoreCard ? 'Score Card verbergen' : 'Maak Score Card'}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 mt-3 ${showScoreCard ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <ScoreCardLazy
              data={{
                teamName,
                tourName,
                gmsScore: totalGmsScore,
                gmsMax,
                dimensions,
              }}
            />
          </div>
        </div>

        <div {...stagger(10)} className="space-y-3 pt-1">
          <button
            onClick={handlePdfDownload}
            disabled={pdfLoading}
            className="w-full py-3.5 rounded-2xl border-2 border-[#0F172A] text-[#0F172A] font-black italic text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60 uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-display, \"Barlow Condensed\", sans-serif)' }}
          >
            {pdfLoading ? (
              <div className="w-4 h-4 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
            ) : (
              <><FileText className="w-4 h-4" /> Download PDF Rapport</>
            )}
          </button>

          <button
            onClick={() => router.push(`/game/${sessionId}/voltooid`)}
            className="w-full py-4 rounded-2xl bg-[#00E676] text-[#0F172A] font-black italic text-base active:scale-[0.97] active:bg-[#00C853] transition-all duration-150 uppercase tracking-wide"
            style={{
              fontFamily: 'var(--font-display, \"Barlow Condensed\", sans-serif)',
              boxShadow: '0 4px 20px rgba(0,230,118,0.30)',
            }}
          >
            Terug naar Overzicht
          </button>
        </div>

        <div className="h-4" />
      </div>

      <BottomNav activeTab="impact" variant="simple" />
    </MobileShell>
  )
}

// Lazy wrapper for ScoreCard (heavy html-to-image dep)
function ScoreCardLazy({ data }: { data: Parameters<typeof import('@/components/game/score-card').ScoreCard>[0]['data'] }) {
  const [Comp, setComp] = useState<React.ComponentType<{ data: typeof data }> | null>(null)
  useEffect(() => {
    import('@/components/game/score-card').then((m) => setComp(() => m.ScoreCard))
  }, [])
  if (!Comp) return <div className="h-20 bg-[#F1F5F9] rounded-2xl animate-pulse" />
  return <Comp data={data} />
}