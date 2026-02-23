'use client'

import { useEffect, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Circle, RefreshCw } from 'lucide-react'
import { MobileShell } from '@/components/layout/mobile-shell'
import { PageHeader } from '@/components/layout/page-header'
import { BottomNav } from '@/components/ui/bottom-nav'
import { HeroCard } from '@/components/ui/hero-card'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { CheckpointInfo, TeamInfo, ScoreboardEntry } from '../page'

interface SessionData {
  tourName: string
  checkpoints: (CheckpointInfo & {
    gmsConnection: number
    gmsMeaning: number
    gmsJoy: number
    gmsGrowth: number
  })[]
  team: TeamInfo
  scoreboard: ScoreboardEntry[]
}

function formatElapsed(startedAtStr: string | null): string {
  if (!startedAtStr) return '—'
  const start = new Date(startedAtStr).getTime()
  const diffMin = Math.round((Date.now() - start) / 60000)
  if (diffMin < 1) return '< 1 min'
  if (diffMin < 60) return `${diffMin} min`
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return m > 0 ? `${h}u ${m}m` : `${h}u`
}

const staggerClass = (i: number) =>
  `animate-slide-up-fade stagger-${Math.min(i + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

export default function PrestatiesPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SessionData | null>(null)

  const load = useCallback(async () => {
    const teamToken = sessionStorage.getItem('teamToken')
    if (!teamToken) {
      router.replace('/join')
      return
    }

    setError(null)
    try {
      const res = await fetch(`/api/game/session/${sessionId}`, {
        headers: { 'x-team-token': teamToken },
      })
      if (!res.ok) {
        if (res.status === 401) { router.replace('/join'); return }
        throw new Error(`HTTP ${res.status}`)
      }
      const json = await res.json()
      setData({
        tourName: json.tour?.name ?? '',
        checkpoints: json.checkpoints ?? [],
        team: json.team,
        scoreboard: json.scoreboard ?? [],
      })
    } catch {
      setError('Kan data niet laden. Controleer je verbinding.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, router])

  useEffect(() => { load() }, [load])

  if (isLoading) {
    return (
      <MobileShell>
        <PageHeader title="Team Prestaties" subtitle="Laden..." />
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* HeroCard skeleton */}
          <div className="bg-gray-100 rounded-2xl h-36 animate-pulse" />
          {/* Progress skeleton */}
          <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
            <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
            <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          </div>
          {/* Checkpoint list skeleton */}
          <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
        </div>
        <BottomNav activeTab="stats" variant="game" />
      </MobileShell>
    )
  }

  if (error || !data) {
    return (
      <MobileShell>
        <PageHeader title="Team Prestaties" />
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
        <BottomNav activeTab="stats" variant="game" />
      </MobileShell>
    )
  }

  const { team, checkpoints, scoreboard } = data
  const completedIds = (team.completedCheckpoints as string[]) ?? []
  const checkpointsDone = completedIds.length
  const checkpointsTotal = checkpoints.length
  const completionPct = checkpointsTotal > 0 ? (checkpointsDone / checkpointsTotal) * 100 : 0

  // Rank uit scoreboard
  const myEntry = scoreboard.find((s) => s.isCurrentTeam)
  const rank = myEntry?.rank ?? 1

  const startedAt = sessionStorage.getItem('startedAt')
  const timeElapsed = formatElapsed(startedAt)

  // GMS breakdown per voltooid checkpoint (max mogelijke punten per checkpoint)
  const completedCheckpoints = checkpoints
    .filter((cp) => completedIds.includes(cp.id))
    .sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <MobileShell>
      <PageHeader
        title="Team Prestaties"
        subtitle={`${team.name} · Positie #${rank}`}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Hero kaart */}
        <div className="animate-slide-up-fade stagger-1">
          <HeroCard
            rank={rank}
            score={team.totalGmsScore}
            trend={team.bonusPoints}
            label="GMS Score"
            teamName={team.name}
          />
        </div>

        {/* Voortgang */}
        <div className="animate-slide-up-fade stagger-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#0F172A]">Checkpoints</span>
            <span className="text-sm font-bold text-[#00C853]">
              {checkpointsDone}/{checkpointsTotal}
            </span>
          </div>
          <ProgressBar value={checkpointsDone} max={checkpointsTotal} />
          <p className="text-xs text-[#64748B] mt-1">{Math.round(completionPct)}% voltooid</p>
        </div>

        {/* Stats grid */}
        <div className="animate-slide-up-fade stagger-3 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-3 text-center">
            <div
              className="text-2xl font-extrabold text-[#0F172A] leading-tight"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {team.totalGmsScore}
            </div>
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mt-0.5">GMS Score</div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-3 text-center">
            <div
              className="text-2xl font-extrabold text-[#0F172A] leading-tight"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {team.bonusPoints}
            </div>
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mt-0.5">Bonus pt</div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-3 text-center">
            <div
              className="text-xl font-extrabold text-[#0F172A] leading-tight"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {timeElapsed}
            </div>
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mt-0.5">Verstreken</div>
          </div>
        </div>

        {/* GMS Breakdown per voltooid checkpoint */}
        {completedCheckpoints.length > 0 && (
          <div className="animate-slide-up-fade stagger-4">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">GMS per Checkpoint</h2>
            <div className="space-y-2">
              {completedCheckpoints.map((cp, i) => {
                const maxPts = cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth
                return (
                  <div
                    key={cp.id}
                    className={`${staggerClass(i + 4)} bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-3 flex items-center gap-3`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#00E676] text-[#0F172A] flex items-center justify-center text-xs font-bold shrink-0">
                      {cp.orderIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#64748B] truncate line-through">{cp.name}</p>
                      <div className="flex gap-2 mt-1">
                        {[
                          { label: 'V', val: cp.gmsConnection, color: '#EC4899' },
                          { label: 'B', val: cp.gmsMeaning, color: '#8B5CF6' },
                          { label: 'P', val: cp.gmsJoy, color: '#F59E0B' },
                          { label: 'G', val: cp.gmsGrowth, color: '#00E676' },
                        ].map(({ label, val, color }) => (
                          <span
                            key={label}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ color, backgroundColor: `${color}18` }}
                          >
                            {label} {val}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="text-lg font-black text-[#0F172A]"
                        style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                      >
                        {maxPts}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">max pt</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Checkpoint milestones */}
        <div className="animate-slide-up-fade stagger-5">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Checkpoint Milestones</h2>
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {checkpoints.map((cp, i) => {
              const isCompleted = completedIds.includes(cp.id)
              const isCurrent = cp.isCurrent
              return (
                <div
                  key={cp.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    i < checkpoints.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                  } ${isCurrent ? 'bg-[#F0FDF4]' : 'active:bg-[#F8FAFC]'}`}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-[#00C853]" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#00E676] bg-[#00E676]/20 flex items-center justify-center animate-pulse-glow">
                        <div className="w-2 h-2 rounded-full bg-[#00E676]" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-[#CBD5E1]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-[#00E676] text-[#0F172A]'
                          : isCurrent
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#E2E8F0] text-[#94A3B8]'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <p
                      className={`text-sm ${
                        isCompleted
                          ? 'text-[#64748B] line-through'
                          : isCurrent
                          ? 'text-[#0F172A] font-semibold'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {cp.name}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#00C853] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      HUIDIG
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="h-4" />
      </div>

      <BottomNav activeTab="stats" variant="game" />
    </MobileShell>
  )
}
