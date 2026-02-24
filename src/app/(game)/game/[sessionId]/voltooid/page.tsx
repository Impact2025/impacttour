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

function getGmsLevel(score: number, max: number) {
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
    const { label } = getGmsLevel(data.gmsScore, data.gmsMax)
    const shareText = `${data.teamName} behaalde ${data.gmsScore} GMS punten — ${label}! 🏆`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'IctusGo Resultaat', text: shareText })
      } catch { /* gebruiker annuleerde */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch { /* clipboard niet beschikbaar */ }
    }
  }

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <MobileShell>
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-4 pt-14 pb-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-24 h-24 rounded-full bg-[#F1F5F9] animate-pulse" />
            </div>
            <div className="h-10 bg-[#F1F5F9] rounded-xl animate-pulse mb-2 mx-6" />
            <div className="h-4 bg-[#F1F5F9] rounded animate-pulse mx-12" />
          </div>
          <div className="px-4 pb-5 space-y-4">
            <div className="bg-[#F1F5F9] rounded-2xl h-52 animate-pulse" />
            <div className="bg-[#F1F5F9] rounded-2xl h-36 animate-pulse" />
            <div className="space-y-3">
              <div className="bg-[#F1F5F9] rounded-2xl h-14 animate-pulse" />
              <div className="bg-[#F1F5F9] rounded-2xl h-14 animate-pulse" />
            </div>
          </div>
        </div>
      </MobileShell>
    )
  }

  /* ── ERROR ── */
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

  const { label, color, bg } = getGmsLevel(data.gmsScore, data.gmsMax)
  const gmsPct = data.gmsMax > 0 ? Math.round((data.gmsScore / data.gmsMax) * 100) : 0

  return (
    <MobileShell>
      <div className="flex-1 overflow-y-auto bg-white">

        {/* ── HERO SECTIE ── */}
        <div className="px-4 pt-14 pb-8 text-center">
          {/* Trophy icon — groot, dramatisch, zonder cirkel */}
          <div className="flex justify-center mb-5 animate-slide-up-fade stagger-1">
            <div className="relative">
              <Trophy
                className="w-20 h-20 text-[#0F172A]"
                strokeWidth={1.2}
              />
              {/* Glow under the trophy */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#00E676]/30 rounded-full blur-md" />
            </div>
          </div>

          <h1
            className="animate-slide-up-fade stagger-2 text-5xl font-black italic text-[#0F172A] mb-1 tracking-tight"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            MISSIE VOLTOOID
          </h1>
          <p
            className="animate-slide-up-fade stagger-2 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Performance Summary
          </p>
          <p className="animate-slide-up-fade stagger-3 text-[#94A3B8] text-sm">{data.tourName}</p>
        </div>

        <div className="px-4 pb-8 space-y-4">

          {/* ── PODIUM ── */}
          <div
            className="animate-slide-up-fade stagger-4 bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}
          >
            <p
              className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] text-center mb-5"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Eindstand
            </p>
            {data.podiumTeams.length > 0 ? (
              <LeaderboardPodium teams={data.podiumTeams} />
            ) : (
              <p className="text-center text-sm text-[#94A3B8] py-4">Nog geen eindstand beschikbaar</p>
            )}
          </div>

          {/* ── GMS SCORE CARD ── */}
          <div
            className="animate-slide-up-fade stagger-5 bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="text-[11px] font-bold text-[#0F172A] uppercase tracking-[0.15em]"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  Geluksmomenten Score
                </p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{data.teamName}</p>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                style={{ color, backgroundColor: bg }}
              >
                {label}
              </span>
            </div>

            {/* Grote score */}
            <div className="flex items-end gap-1.5 mb-4">
              <span
                className="text-[64px] font-black text-[#0F172A] leading-none"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {data.gmsScore}
              </span>
              <div className="mb-2">
                <span className="text-xl font-bold text-[#94A3B8]">PTS</span>
                <p className="text-xs text-[#94A3B8]">{gmsPct}% van max</p>
              </div>
            </div>

            <ProgressBar value={data.gmsScore} max={data.gmsMax} />

            {/* Impact momenten */}
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <Zap className="w-3 h-3 text-[#00C853]" />
              </div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                {data.checkpointsDone} impact momenten geregistreerd
              </span>
            </div>
          </div>

          {/* ── LOCATIE ── */}
          <div
            className="animate-slide-up-fade stagger-6 bg-white rounded-2xl p-4 flex items-center gap-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-0.5">
                Locatie
              </p>
              <p className="text-sm font-bold text-[#0F172A] truncate uppercase tracking-wide">
                {data.tourName || '—'}
              </p>
            </div>
          </div>

          {/* ── CTA KNOPPEN ── */}
          <div className="animate-slide-up-fade stagger-7 space-y-3 pt-2">
            <button
              onClick={() => router.push(`/game/${sessionId}/rapport`)}
              className="w-full py-4 rounded-2xl border-2 border-[#0F172A] text-[#0F172A] font-black italic text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-150 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              <FileText className="w-4 h-4" />
              Bekijk Rapport
            </button>
            <button
              onClick={handleShare}
              className="w-full py-4 rounded-2xl bg-[#00E676] text-[#0F172A] font-black italic text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-150 uppercase tracking-wide"
              style={{
                fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
                boxShadow: '0 4px 20px rgba(0,230,118,0.35)',
              }}
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Gekopieerd!</>
              ) : (
                <><Share2 className="w-4 h-4" /> Deel Resultaat</>
              )}
            </button>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </MobileShell>
  )
}
