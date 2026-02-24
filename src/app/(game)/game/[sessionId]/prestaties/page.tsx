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

const cardShadow = { boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }

export default function PrestatiesPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SessionData | null>(null)

  const load = useCallback(async () => {
    const teamToken = sessionStorage.getItem('teamToken')
    if (!teamToken) { router.replace('/join'); return }

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
          <div className="bg-[#E2E8F0] rounded-2xl h-36 animate-pulse" />
          <div className="bg-[#E2E8F0] rounded-2xl h-20 animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <div key={i} className="bg-[#E2E8F0] rounded-2xl h-24 animate-pulse" />)}
          </div>
          <div className="bg-[#E2E8F0] rounded-2xl h-48 animate-pulse" />
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

  const myEntry = scoreboard.find((s) => s.isCurrentTeam)
  const rank = myEntry?.rank ?? 1

  const startedAt = sessionStorage.getItem('startedAt')
  const timeElapsed = formatElapsed(startedAt)

  const completedCheckpoints = checkpoints
    .filter((cp) => completedIds.includes(cp.id))
    .sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <MobileShell>
      <PageHeader
        title="Team Prestaties"
        subtitle={`${team.name} · #${rank}`}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* ── HERO CARD ── */}
        <div className="animate-slide-up-fade stagger-1">
          <HeroCard
            rank={rank}
            score={team.totalGmsScore}
            trend={team.bonusPoints}
            label="GMS Score"
            teamName={team.name}
          />
        </div>

        {/* ── VOORTGANG ── */}
        <div
          className="animate-slide-up-fade stagger-2 bg-white rounded-2xl p-4"
          style={cardShadow}
        >
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-sm font-bold text-[#0F172A]">Checkpoints voltooid</span>
            <span
              className="text-lg font-black text-[#00C853] leading-none"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {checkpointsDone}/{checkpointsTotal}
            </span>
          </div>
          <ProgressBar value={checkpointsDone} max={checkpointsTotal} />
          <p className="text-xs text-[#94A3B8] mt-1.5">{Math.round(completionPct)}% van de tocht voltooid</p>
        </div>

        {/* ── STATS GRID ── */}
        <div className="animate-slide-up-fade stagger-3 grid grid-cols-3 gap-3">
          {[
            { value: String(team.totalGmsScore), label: 'GMS SCORE' },
            { value: String(team.bonusPoints), label: 'BONUS PT' },
            { value: timeElapsed, label: 'VERSTREKEN' },
          ].map(({ value, label }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center"
              style={cardShadow}
            >
              <div
                className="text-[32px] font-black text-[#0F172A] leading-none"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {value}
              </div>
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mt-1 font-semibold">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── GMS BREAKDOWN PER CHECKPOINT ── */}
        {completedCheckpoints.length > 0 && (
          <div className="animate-slide-up-fade stagger-4">
            <h2
              className="text-xs font-bold text-[#0F172A] mb-3 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              GMS per Checkpoint
            </h2>
            <div className="space-y-2">
              {completedCheckpoints.map((cp, i) => {
                const maxPts = cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth
                return (
                  <div
                    key={cp.id}
                    className={`${staggerClass(i + 4)} bg-white rounded-2xl p-3 flex items-center gap-3`}
                    style={cardShadow}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#00E676] text-[#0F172A] flex items-center justify-center text-xs font-black shrink-0"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      {cp.orderIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#94A3B8] truncate line-through">{cp.name}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {[
                          { label: 'V', val: cp.gmsConnection, color: '#EC4899' },
                          { label: 'B', val: cp.gmsMeaning, color: '#8B5CF6' },
                          { label: 'P', val: cp.gmsJoy, color: '#F59E0B' },
                          { label: 'G', val: cp.gmsGrowth, color: '#00E676' },
                        ].map(({ label, val, color }) => (
                          <span
                            key={label}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ color, backgroundColor: `${color}18` }}
                          >
                            {label} {val}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="text-2xl font-black text-[#0F172A] leading-none"
                        style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                      >
                        {maxPts}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] font-semibold">max pt</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── CHECKPOINT MILESTONES ── */}
        <div className="animate-slide-up-fade stagger-5">
          <h2
            className="text-xs font-bold text-[#0F172A] mb-3 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Checkpoint Milestones
          </h2>
          <div className="space-y-2">
            {checkpoints.map((cp, i) => {
              const isCompleted = completedIds.includes(cp.id)
              const isCurrent = cp.isCurrent
              return (
                <div
                  key={cp.id}
                  className={`bg-white rounded-2xl flex items-center gap-3 px-4 py-3 ${
                    isCurrent ? 'ring-1 ring-[#00E676]/40' : ''
                  }`}
                  style={{
                    boxShadow: isCurrent
                      ? '0 2px 12px rgba(0,230,118,0.15), 0 1px 3px rgba(0,0,0,0.04)'
                      : '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-[#00C853]" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#00E676] bg-[#00E676]/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-[#CBD5E1]" />
                    )}
                  </div>

                  <span
                    className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-[#00E676] text-[#0F172A]'
                        : isCurrent
                        ? 'bg-[#0F172A] text-white'
                        : 'bg-[#F1F5F9] text-[#94A3B8]'
                    }`}
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {i + 1}
                  </span>

                  <p
                    className={`text-sm flex-1 truncate ${
                      isCompleted
                        ? 'text-[#94A3B8] line-through'
                        : isCurrent
                        ? 'text-[#0F172A] font-bold'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {cp.name}
                  </p>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#00C853] bg-[#DCFCE7] px-2.5 py-1 rounded-full shrink-0">
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
