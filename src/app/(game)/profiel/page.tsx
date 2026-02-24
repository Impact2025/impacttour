'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Heart, Lightbulb, Smile, TrendingUp, RefreshCw, Trophy } from 'lucide-react'
import { MobileShell } from '@/components/layout/mobile-shell'
import { PageHeader } from '@/components/layout/page-header'
import { BottomNav } from '@/components/ui/bottom-nav'
import { AvatarRing } from '@/components/ui/avatar-ring'
import { MiniBarChart } from '@/components/ui/mini-bar-chart'
import { BadgeItem } from '@/components/ui/badge-item'
import { ProgressBar } from '@/components/ui/progress-bar'

type Tab = 'overzicht' | 'prestaties'

type SessionData = {
  team: {
    name: string
    totalGmsScore: number
    bonusPoints: number
    completedCheckpoints: string[]
  }
  checkpoints: { id: string }[]
  scoreboard: { rank: number; isCurrentTeam: boolean; totalGmsScore: number }[]
}

type RapportData = {
  teamName: string
  totalGmsScore: number
  gmsMax: number
  rank: number
  totalTeams: number
  dimensionPercentages: { connection: number; meaning: number; joy: number; growth: number }
  checkpointScores: { name: string; gmsEarned: number }[]
  coachInsight: string
}

export default function ProfielPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overzicht')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<SessionData | null>(null)
  const [rapport, setRapport] = useState<RapportData | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const teamToken = sessionStorage.getItem('teamToken')
    const sessionId = sessionStorage.getItem('sessionId')

    if (!teamToken || !sessionId) {
      router.replace('/join')
      return
    }

    try {
      const headers = { 'x-team-token': teamToken }
      const [sessionRes, rapportRes] = await Promise.all([
        fetch(`/api/game/session/${sessionId}`, { headers }),
        fetch(`/api/game/rapport/${sessionId}`, { headers }),
      ])

      if (!sessionRes.ok || !rapportRes.ok) {
        throw new Error('Kon gegevens niet ophalen')
      }

      const [sessionData, rapportData] = await Promise.all([
        sessionRes.json(),
        rapportRes.json(),
      ])

      setSession(sessionData)
      setRapport(rapportData)
    } catch {
      setError('Kon profielgegevens niet laden.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  // Derive badges from dimension percentages
  const badges = rapport
    ? [
        { icon: Heart, label: 'Verbinder', earned: rapport.dimensionPercentages.connection >= 70 },
        { icon: Lightbulb, label: 'Creatief', earned: rapport.dimensionPercentages.growth >= 70 },
        { icon: Smile, label: 'Enthousiast', earned: rapport.dimensionPercentages.joy >= 70 },
        { icon: TrendingUp, label: 'Groeier', earned: rapport.dimensionPercentages.growth >= 80 },
        { icon: Heart, label: 'Empathisch', earned: rapport.dimensionPercentages.meaning >= 70 },
        { icon: Trophy, label: 'Hoge Impact', earned: rapport.totalGmsScore >= rapport.gmsMax * 0.7 },
      ]
    : []

  const completedCount = session
    ? Array.isArray(session.team.completedCheckpoints) ? session.team.completedCheckpoints.length : 0
    : 0
  const totalCount = session?.checkpoints?.length ?? 0
  const myRank = rapport?.rank ?? (session?.scoreboard.find((s) => s.isCurrentTeam)?.rank ?? 0)

  // Chart data from checkpointScores
  const chartData = rapport?.checkpointScores.map((cp, i) => ({
    day: `CP${i + 1}`,
    value: cp.gmsEarned,
    isCurrent: i === rapport.checkpointScores.length - 1,
  })) ?? []

  // Skeleton loading
  if (isLoading) {
    return (
      <MobileShell>
        <PageHeader title="Spelersprofiel" ActionIcon={Settings} />
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-gray-100 rounded-full w-20 h-20 animate-pulse" />
            <div className="bg-gray-100 rounded-xl h-5 w-32 animate-pulse" />
            <div className="bg-gray-100 rounded-xl h-4 w-24 animate-pulse" />
          </div>
          <div className="bg-gray-100 rounded-xl h-16 animate-pulse" />
          <div className="bg-gray-100 rounded-xl h-40 animate-pulse" />
          <div className="bg-gray-100 rounded-xl h-32 animate-pulse" />
        </div>
        <BottomNav activeTab="profiel" variant="simple" />
      </MobileShell>
    )
  }

  // Error state
  if (error || !session || !rapport) {
    return (
      <MobileShell>
        <PageHeader title="Spelersprofiel" ActionIcon={Settings} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4 text-center">
          <p className="text-[#0F172A] font-semibold text-sm">{error ?? 'Profiel niet beschikbaar'}</p>
          <button
            onClick={() => { setIsLoading(true); load() }}
            className="inline-flex items-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-5 py-2.5 rounded-xl"
          >
            <RefreshCw className="w-4 h-4" /> Opnieuw proberen
          </button>
        </div>
        <BottomNav activeTab="profiel" variant="simple" />
      </MobileShell>
    )
  }

  const teamName = session.team.name
  const gmsScore = session.team.totalGmsScore
  const bonusPoints = session.team.bonusPoints ?? 0

  return (
    <MobileShell>
      <PageHeader title="Spelersprofiel" ActionIcon={Settings} />

      <div className="flex-1 overflow-y-auto">
        {/* Profiel hero */}
        <div className="animate-slide-up-fade stagger-1 px-4 pt-6 pb-4 flex flex-col items-center text-center border-b border-[#E2E8F0]">
          <AvatarRing name={teamName} size="xl" />
          <h2 className="text-lg font-bold text-[#0F172A] mt-5">{teamName}</h2>
          {myRank > 0 && (
            <span className="mt-2 inline-flex items-center bg-[#DCFCE7] text-[#00C853] text-xs font-bold px-3 py-1 rounded-full">
              #{myRank} in het scorebord
            </span>
          )}
          <span
            className="mt-2 inline-flex items-center bg-[#0F172A] text-[#00E676] text-xs font-bold px-3 py-1 rounded-full tracking-wider"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            GMS {gmsScore} PT
          </span>
        </div>

        {/* Stats row */}
        <div className="animate-slide-up-fade stagger-2 px-4 py-4 flex gap-3 border-b border-[#E2E8F0]">
          {[
            { label: 'GMS SCORE', value: gmsScore.toLocaleString('nl-NL') },
            { label: 'CHECKPOINTS', value: `${completedCount}/${totalCount}` },
            { label: 'BONUS PT', value: bonusPoints.toLocaleString('nl-NL') },
          ].map((s) => (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
              <span
                className="text-2xl font-extrabold text-[#0F172A] leading-tight"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {s.value}
              </span>
              <span className="text-[9px] text-[#94A3B8] font-semibold uppercase tracking-wider text-center leading-tight">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="animate-slide-up-fade stagger-3 flex border-b border-[#E2E8F0] px-4">
          {(['overzicht', 'prestaties'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-all duration-200 border-b-2 active:scale-95 ${
                activeTab === tab
                  ? 'text-[#00C853] border-[#00E676]'
                  : 'text-[#64748B] border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab inhoud */}
        <div key={activeTab} className="animate-fade-in px-4 py-4 space-y-5">
          {activeTab === 'overzicht' && (
            <>
              {/* Checkpoint score grafiek */}
              {chartData.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-3">GMS per Checkpoint</h3>
                  <MiniBarChart data={chartData} />
                </div>
              )}

              {/* Coach insight */}
              {rapport.coachInsight && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Coach Inzicht</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{rapport.coachInsight}</p>
                </div>
              )}

              {/* Badges */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0F172A]">Behaalde Badges</h3>
                  <span className="text-xs text-[#64748B]">
                    {badges.filter((b) => b.earned).length}/{badges.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {badges.map((b, i) => (
                    <div
                      key={i}
                      className={`animate-scale-in stagger-${Math.min(i + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8} card-pressable`}
                    >
                      <BadgeItem Icon={b.icon} label={b.label} earned={b.earned} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'prestaties' && (
            <div className="space-y-3">
              {/* Totale stats */}
              {[
                { label: 'Totale GMS Score', display: gmsScore, value: gmsScore, max: rapport.gmsMax },
                { label: 'Voltooide Checkpoints', display: `${completedCount}/${totalCount}`, value: completedCount, max: totalCount || 5 },
                { label: 'Bonus Punten', display: bonusPoints, value: bonusPoints, max: 100 },
                {
                  label: 'Ranking',
                  display: `#${myRank > 0 ? myRank : 1} van ${rapport.totalTeams}`,
                  value: rapport.totalTeams - (myRank > 0 ? myRank : 1) + 1,
                  max: rapport.totalTeams || 1,
                },
              ].map((p, i) => (
                <div
                  key={p.label}
                  className={`animate-slide-up-fade stagger-${Math.min(i + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8} bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B]">{p.label}</span>
                    <span className="text-lg font-bold text-[#0F172A]">{p.display}</span>
                  </div>
                  <ProgressBar value={p.value} max={p.max || 1} />
                </div>
              ))}

              {/* GMS dimensies */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4">GMS Dimensies</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Verbinding', value: rapport.dimensionPercentages.connection, color: '#3B82F6' },
                    { label: 'Betekenis', value: rapport.dimensionPercentages.meaning, color: '#8B5CF6' },
                    { label: 'Plezier', value: rapport.dimensionPercentages.joy, color: '#F59E0B' },
                    { label: 'Groei', value: rapport.dimensionPercentages.growth, color: '#00E676' },
                  ].map((dim) => (
                    <div key={dim.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#64748B]">{dim.label}</span>
                        <span className="text-xs font-bold text-[#0F172A]">{dim.value}%</span>
                      </div>
                      <ProgressBar value={dim.value} max={100} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      <BottomNav activeTab="profiel" variant="simple" />
    </MobileShell>
  )
}
