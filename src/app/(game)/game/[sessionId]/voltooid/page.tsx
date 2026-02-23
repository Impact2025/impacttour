'use client'

import { useEffect, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Share2, FileText, MapPin, Trophy, Zap, RefreshCw, Check } from 'lucide-react'
import { MobileShell } from '@/components/layout/mobile-shell'
import { LeaderboardPodium } from '@/components/ui/leaderboard-podium'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { ScoreboardEntry } from '../page'

interface CheckpointRaw {
  id: string
  gmsConnection: number
  gmsMeaning: number
  gmsJoy: number
  gmsGrowth: number
}

interface VoltooidData {
  tourName: string
  teamName: string
  gmsScore: number
  gmsMax: number
  podiumTeams: { name: string; score: number; rank: 1 | 2 | 3 }[]
  checkpointsDone: number
}

function GmsLevel(score: number, max: number) {
  const pct = max > 0 ? (score / max) * 100 : 0
  if (pct >= 70) return { label: 'Hoge Impact', color: '#00C853', bg: '#DCFCE7' }
  if (pct >= 40) return { label: 'Gemiddelde Impact', color: '#F59E0B', bg: '#FEF3C7' }
  return { label: 'Lage Impact', color: '#EF4444', bg: '#FEE2E2' }
}

export default function VoltooidPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<VoltooidData | null>(null)
  const [copied, setCopied] = useState(false)

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

      const checkpoints: CheckpointRaw[] = json.checkpoints ?? []
      const gmsMax = checkpoints.reduce(
        (sum: number, cp: CheckpointRaw) =>
          sum + cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth,
        0
      )

      const scoreboard: ScoreboardEntry[] = json.scoreboard ?? []
      const top3 = scoreboard
        .slice(0, 3)
        .map((s) => ({ name: s.teamName, score: s.totalGmsScore, rank: s.rank as 1 | 2 | 3 }))

      const myTeam = json.team
      const completedIds = (myTeam?.completedCheckpoints as string[]) ?? []

      setData({
        tourName: json.tour?.name ?? '',
        teamName: myTeam?.name ?? '',
        gmsScore: myTeam?.totalGmsScore ?? 0,
        gmsMax: gmsMax || 400,
        podiumTeams: top3,
        checkpointsDone: completedIds.length,
      })
    } catch {
      setError('Kan data niet laden. Controleer je verbinding.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, router])

  useEffect(() => { load() }, [load])

  const handleShare = async () => {
    if (!data) return
    const { label } = GmsLevel(data.gmsScore, data.gmsMax)
    const shareText = `${data.teamName} behaalde ${data.gmsScore} GMS punten — ${label}!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ImpactTocht Resultaat',
          text: shareText,
        })
      } catch {
        // user cancelled share
      }
    } else {
      // Fallback: kopieer naar clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        // clipboard not available
      }
    }
  }

  if (isLoading) {
    return (
      <MobileShell>
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-4 pt-12 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
            </div>
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse mb-2 mx-8" />
            <div className="h-4 bg-gray-100 rounded animate-pulse mx-12" />
          </div>
          <div className="px-4 pb-5 space-y-4">
            <div className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
            <div className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-2xl h-14 animate-pulse" />
              <div className="bg-gray-100 rounded-2xl h-14 animate-pulse" />
            </div>
          </div>
        </div>
      </MobileShell>
    )
  }

  if (error || !data) {
    return (
      <MobileShell>
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
      </MobileShell>
    )
  }

  const { label, color, bg } = GmsLevel(data.gmsScore, data.gmsMax)

  return (
    <MobileShell>
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Hero sectie — wit */}
        <div className="px-4 pt-12 pb-8 text-center">
          <div className="flex justify-center mb-4 animate-slide-up-fade stagger-1">
            <div className="w-20 h-20 rounded-full bg-[#F0FDF4] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-[#0F172A]" strokeWidth={1.5} />
            </div>
          </div>

          <h1
            className="animate-slide-up-fade stagger-2 text-4xl font-extrabold italic text-[#0F172A] mb-1 tracking-tight"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            MISSIE VOLTOOID
          </h1>
          <p
            className="animate-slide-up-fade stagger-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            PERFORMANCE SUMMARY
          </p>
          <p className="animate-slide-up-fade stagger-3 text-[#94A3B8] text-sm">{data.tourName}</p>
        </div>

        <div className="px-4 pb-5 space-y-4">
          {/* Podium */}
          <div className="animate-slide-up-fade stagger-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <h2
              className="text-sm font-bold text-[#0F172A] mb-4 text-center uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Eindstand
            </h2>
            {data.podiumTeams.length > 0 ? (
              <LeaderboardPodium teams={data.podiumTeams} />
            ) : (
              <p className="text-center text-sm text-[#94A3B8]">Nog geen eindstand beschikbaar</p>
            )}
          </div>

          {/* GMS Score card */}
          <div className="animate-slide-up-fade stagger-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-xs font-bold text-[#0F172A] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                GELUKSMOMENTEN SCORE
              </p>
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                {data.teamName}
              </p>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span
                className="text-5xl font-extrabold text-[#0F172A] leading-none"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {data.gmsScore}
              </span>
              <span className="text-[#64748B] text-sm">/ {data.gmsMax}</span>
              <span
                className="ml-auto text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ color, backgroundColor: bg }}
              >
                {label}
              </span>
            </div>
            <ProgressBar value={data.gmsScore} max={data.gmsMax} />
            <div className="flex items-center gap-1.5 mt-3">
              <Zap className="w-3.5 h-3.5 text-[#00C853]" />
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                {data.checkpointsDone} CHECKPOINTS VOLTOOID
              </span>
            </div>
          </div>

          {/* Locatie rij */}
          <div className="animate-slide-up-fade stagger-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] shrink-0 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <div>
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                TOCHT
              </p>
              <p className="text-sm font-semibold text-[#0F172A]">{data.tourName || '—'}</p>
            </div>
            <MapPin className="w-4 h-4 text-[#94A3B8] ml-auto" />
          </div>

          {/* CTA buttons */}
          <div className="animate-slide-up-fade stagger-7 space-y-3">
            <button
              onClick={() => router.push(`/game/${sessionId}/rapport`)}
              className="w-full py-4 rounded-2xl border-2 border-[#00E676] text-[#00C853] font-extrabold italic text-sm flex items-center justify-center gap-2 active:scale-[0.97] active:bg-[#F0FDF4] transition-all duration-150 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              <FileText className="w-4 h-4" />
              BEKIJK IMPACT RAPPORT
            </button>
            <button
              onClick={handleShare}
              className="w-full py-4 rounded-2xl bg-[#00E676] text-[#0F172A] font-extrabold italic text-sm flex items-center justify-center gap-2 active:scale-[0.97] active:bg-[#00C853] transition-all duration-150 shadow-md shadow-[#00E676]/30 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  GEKOPIEERD!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  DEEL RESULTAAT
                </>
              )}
            </button>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </MobileShell>
  )
}
