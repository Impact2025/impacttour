'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import {
  Map, FileText, BarChart2, Target, Clock, Pause, Trophy, Flag,
  AlertTriangle, WifiOff, Radio, Navigation, Zap,
} from 'lucide-react'
import { useGPS, type GPSPosition } from '@/hooks/use-gps'
import { usePusherChannel } from '@/hooks/use-pusher-channel'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { haversineDistance } from '@/lib/geo'
import { MissionPanel } from './mission-panel'
import { Scoreboard } from './scoreboard'
import { ChatPanel } from './chat-panel'

const GameMap = dynamic(() => import('./game-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F0FDF4]">
      <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
        <div className="w-8 h-8 border-2 border-[#CBD5E1] border-t-[#00E676] rounded-full animate-spin" />
        <p className="text-sm">Kaart laden...</p>
      </div>
    </div>
  ),
})

export interface CheckpointInfo {
  id: string
  orderIndex: number
  name: string
  type: string
  latitude: number
  longitude: number
  unlockRadiusMeters: number
  missionTitle: string | null
  missionDescription: string | null
  missionType: string
  hint1: string | null
  hint2: string | null
  hint3: string | null
  isKidsFriendly: boolean
  timeLimitSeconds: number | null
  bonusPhotoPoints: number
  isCompleted: boolean
  isCurrent: boolean
}

export interface TeamInfo {
  id: string
  name: string
  currentCheckpointIndex: number
  completedCheckpoints: string[]
  totalGmsScore: number
  bonusPoints: number
  isOutsideGeofence: boolean
}

export interface ScoreboardEntry {
  rank: number
  teamName: string
  totalGmsScore: number
  checkpointsDone: number
  isCurrentTeam: boolean
}

type GameView = 'map' | 'mission' | 'score'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const isOnline = useOnlineStatus()
  const [teamToken, setTeamToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionStatus, setSessionStatus] = useState<string>('active')
  const [joinCode, setJoinCode] = useState<string>('')
  const [variant, setVariant] = useState<string>('wijktocht')
  const [tourName, setTourName] = useState<string>('')
  const [storyFrame, setStoryFrame] = useState<{ introText: string; finaleReveal: string } | null>(null)
  const [checkpoints, setCheckpoints] = useState<CheckpointInfo[]>([])
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  const [activeView, setActiveView] = useState<GameView>('map')
  const [chatOpen, setChatOpen] = useState(false)
  const [nearbyCheckpoint, setNearbyCheckpoint] = useState<CheckpointInfo | null>(null)
  const [activeCheckpoint, setActiveCheckpoint] = useState<CheckpointInfo | null>(null)

  const { position, error: gpsError, isWatching, startWatching } = useGPS({
    onPosition: useCallback(
      async (pos: GPSPosition) => {
        if (!teamToken) return
        fetch('/api/game/gps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, teamToken, latitude: pos.latitude, longitude: pos.longitude, accuracy: pos.accuracy }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.isOutsideGeofence) toast.error('Jullie zijn buiten de speelzone!', { id: 'geofence' })
          })
          .catch(() => {})

        if (!team) return
        const current = checkpoints.find((c) => c.isCurrent)
        if (!current) return
        const dist = haversineDistance(pos.latitude, pos.longitude, current.latitude, current.longitude)
        setNearbyCheckpoint(dist <= current.unlockRadiusMeters ? current : null)
      },
      [sessionId, teamToken, team, checkpoints]
    ),
    minDistance: 3,
    maxAccuracy: 50,
  })

  usePusherChannel(
    sessionId,
    {
      'score-update': (data) => {
        setScoreboard((prev) =>
          prev.map((s) => s.teamName === data.teamName ? { ...s, totalGmsScore: data.totalGmsScore } : s)
            .sort((a, b) => b.totalGmsScore - a.totalGmsScore)
            .map((s, idx) => ({ ...s, rank: idx + 1 }))
        )
      },
      'checkpoint-unlocked': (data) => {
        toast.success(`${data.teamName} voltooide checkpoint ${data.checkpointIndex + 1}!`, { duration: 3000 })
      },
      'session-status': (data) => {
        setSessionStatus(data.status)
        if (data.status === 'completed') toast.success('De tocht is afgelopen!', { duration: 0 })
        else if (data.status === 'paused') toast('De tocht is gepauzeerd door de spelleider')
        else if (data.status === 'active') toast.success('De tocht is hervat!')
      },
    },
    // Fallback polling bij Pusher disconnect (teamToken beschikbaar zodra sessie geladen is)
    { teamToken: teamToken ?? undefined }
  )

  useEffect(() => {
    const token = sessionStorage.getItem('teamToken')
    if (!token) { router.replace('/join'); return }
    setTeamToken(token)
  }, [router])

  useEffect(() => {
    if (!teamToken) return
    const load = async () => {
      try {
        const res = await fetch(`/api/game/session/${sessionId}`, { headers: { 'x-team-token': teamToken } })
        if (!res.ok) {
          if (res.status === 401) { sessionStorage.removeItem('teamToken'); router.replace('/join') }
          return
        }
        const data = await res.json()
        setSessionStatus(data.status)
        setVariant(data.variant)
        setTourName(data.tour?.name ?? '')
        setStoryFrame(data.tour?.storyFrame ?? null)
        setJoinCode(data.joinCode ?? '')
        setCheckpoints(data.checkpoints ?? [])
        setTeam(data.team)
        setScoreboard(data.scoreboard ?? [])
      } catch {
        toast.error('Fout bij laden van game data')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [sessionId, teamToken, router])

  useEffect(() => {
    if (!isLoading && teamToken && !isWatching) startWatching()
  }, [isLoading, teamToken, isWatching, startWatching])

  const handleCheckpointUnlock = async () => {
    if (!nearbyCheckpoint || !teamToken || !position) return
    try {
      const res = await fetch('/api/game/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, teamToken, checkpointId: nearbyCheckpoint.id, latitude: position.latitude, longitude: position.longitude }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Unlock mislukt'); return }
      toast.success(`Checkpoint ${nearbyCheckpoint.orderIndex + 1} bereikt!`)
      setActiveCheckpoint(nearbyCheckpoint)
      setNearbyCheckpoint(null)
      setActiveView('mission')
      const refresh = await fetch(`/api/game/session/${sessionId}`, { headers: { 'x-team-token': teamToken } })
      if (refresh.ok) {
        const d = await refresh.json()
        setCheckpoints(d.checkpoints ?? [])
        setTeam(d.team)
        setScoreboard(d.scoreboard ?? [])
      }
    } catch {
      toast.error('Verbindingsfout')
    }
  }

  const handleMissionSubmit = async (answer: string, photoUrl?: string) => {
    if (!activeCheckpoint || !teamToken) return null
    const res = await fetch('/api/game/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, teamToken, checkpointId: activeCheckpoint.id, answer: answer || undefined, photoUrl: photoUrl || undefined }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'Inzending mislukt'); return null }
    const refresh = await fetch(`/api/game/session/${sessionId}`, { headers: { 'x-team-token': teamToken } })
    if (refresh.ok) {
      const d = await refresh.json()
      setCheckpoints(d.checkpoints ?? [])
      setTeam(d.team)
      setScoreboard(d.scoreboard ?? [])
    }
    return data.submission
  }

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-[#F0FDF4] overflow-hidden">
        <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E2E8F0] animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-20 h-2.5 bg-[#E2E8F0] rounded animate-pulse" />
              <div className="w-28 h-3.5 bg-[#E2E8F0] rounded animate-pulse" />
            </div>
          </div>
          <div className="w-12 h-8 bg-[#E2E8F0] rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 bg-gray-200 animate-pulse" />
        <div className="bg-white border-t border-[#E2E8F0] flex shrink-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center py-3 gap-1.5">
              <div className="w-7 h-7 bg-[#E2E8F0] rounded-full animate-pulse" />
              <div className="w-10 h-2.5 bg-[#E2E8F0] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── LOBBY ── */
  if (sessionStatus === 'lobby') {
    const isFootball = variant === 'voetbalmissie'
    const LobbyIcon = isFootball ? Target : Clock
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isFootball ? 'bg-[#0A1A0A]' : 'bg-[#F0FDF4]'}`}>
        <div className="text-center max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isFootball ? 'bg-green-800' : 'bg-[#DCFCE7]'}`}>
              <LobbyIcon className={`w-8 h-8 ${isFootball ? 'text-[#00E676]' : 'text-[#00C853]'}`} />
            </div>
          </div>
          <h1 className={`text-2xl font-black mb-3 ${isFootball ? 'text-white' : 'text-[#0F172A]'}`} style={{ fontFamily: 'var(--font-display)' }}>
            {isFootball ? 'De Missie begint zo...' : 'Wachten op start...'}
          </h1>
          {isFootball && storyFrame?.introText ? (
            <div className="bg-green-800/50 border border-green-700 rounded-2xl p-4 mb-5 text-left">
              <p className="text-green-100 text-sm leading-relaxed">{storyFrame.introText}</p>
            </div>
          ) : (
            <p className={`mb-5 text-sm ${isFootball ? 'text-green-300' : 'text-[#64748B]'}`}>
              De spelleider start de tocht zodra iedereen klaar is.
            </p>
          )}
          <div className={`rounded-2xl p-4 space-y-1.5 ${isFootball ? 'bg-green-900/50' : 'bg-white'}`}>
            <p className={`text-sm ${isFootball ? 'text-green-300' : 'text-[#64748B]'}`}>
              Team: <strong className={isFootball ? 'text-white' : 'text-[#0F172A]'}>{team?.name}</strong>
            </p>
            {joinCode && (
              <p className={`text-sm ${isFootball ? 'text-green-300' : 'text-[#64748B]'}`}>
                Code: <strong className="text-[#00E676] tracking-widest font-mono">{joinCode}</strong>
              </p>
            )}
            <p className={`text-sm ${isFootball ? 'text-green-300' : 'text-[#64748B]'}`}>
              Teams aangemeld: <strong className={isFootball ? 'text-white' : 'text-[#0F172A]'}>{scoreboard.length}</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── PAUSED ── */
  if (sessionStatus === 'paused') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB] p-6">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] flex items-center justify-center">
              <Pause className="w-8 h-8 text-[#F59E0B]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Tocht gepauzeerd</h1>
          <p className="text-[#64748B] text-sm">De spelleider heeft de tocht tijdelijk gepauzeerd.</p>
        </div>
      </div>
    )
  }

  /* ── COMPLETED ── */
  if (sessionStatus === 'completed') {
    const myScore = team?.totalGmsScore ?? 0
    const myBonus = team?.bonusPoints ?? 0
    const isFootball = variant === 'voetbalmissie'
    const CompletedIcon = isFootball ? Trophy : Flag
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4] p-6">
        <div className="text-center max-w-sm w-full">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center">
              <CompletedIcon className="w-8 h-8 text-[#00C853]" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            {isFootball ? 'Missie geslaagd! 🏆' : 'Tocht voltooid!'}
          </h1>
          {isFootball && storyFrame?.finaleReveal && (
            <div className="bg-green-100 border border-green-200 rounded-2xl p-4 mb-5 text-left">
              <p className="text-green-800 text-sm leading-relaxed italic">&ldquo;{storyFrame.finaleReveal}&rdquo;</p>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Jullie eindscore</p>
            <div className="text-6xl font-black text-[#0F172A] mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{myScore}</div>
            <p className="text-sm text-[#94A3B8]">GMS punten</p>
            {myBonus > 0 && (
              <p className="text-[#F59E0B] text-sm font-bold mt-1.5">+{myBonus} bonus punten</p>
            )}
          </div>
          <div className="space-y-2">
            {scoreboard.slice(0, 5).map((s) => (
              <div key={s.teamName} className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-sm ${s.isCurrentTeam ? 'bg-[#DCFCE7] border border-[#00E676] font-bold text-[#0F172A]' : 'bg-white text-[#64748B]'}`}>
                <span>{s.rank}. {s.teamName}</span>
                <span className={s.isCurrentTeam ? 'text-[#00C853]' : ''}>{s.totalGmsScore} pt</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── ACTIVE GAME ── */
  const currentCheckpoint = checkpoints.find((c) => c.isCurrent)
  const completedCount = (team?.completedCheckpoints as string[] ?? []).length
  const totalCount = checkpoints.length
  const isKids = variant === 'jeugdtocht' || variant === 'voetbalmissie'
  const teamInitial = team?.name?.[0]?.toUpperCase() ?? 'T'

  const tabs = [
    { id: 'map' as GameView, label: 'Kaart', Icon: Map },
    { id: 'mission' as GameView, label: 'Missie', Icon: FileText, disabled: !activeCheckpoint },
    { id: 'score' as GameView, label: 'Score', Icon: BarChart2 },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#F0FDF4] overflow-hidden">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 shrink-0 shadow-sm"
        style={{ paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))', paddingBottom: '12px' }}>
        <div className="flex items-center justify-between">
          {/* Links: team info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#00E676] flex items-center justify-center text-[#0F172A] font-black text-sm shrink-0">
              {teamInitial}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider leading-none truncate">{tourName}</p>
              <h1 className="text-sm font-bold text-[#0F172A] leading-snug truncate">{team?.name}</h1>
            </div>
          </div>

          {/* Rechts: GPS + score */}
          <div className="flex items-center gap-3 shrink-0">
            {gpsError ? (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full">
                <Radio className="w-3 h-3" /> GPS: off
              </span>
            ) : isWatching ? (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-[#00C853] bg-[#DCFCE7] px-2 py-1 rounded-full">
                <Navigation className="w-3 h-3" /> GPS
              </span>
            ) : null}
            <div className="text-right">
              <div className="text-2xl font-black text-[#0F172A] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                {team?.totalGmsScore ?? 0}
              </div>
              <div className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">
                {(team?.bonusPoints ?? 0) > 0 ? `+${team!.bonusPoints} bonus` : 'GMS'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── BANNERTJES ── */}
      {!isOnline && (
        <div className="bg-[#F59E0B] text-white px-4 py-2 text-xs text-center font-semibold shrink-0 flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          Offline — kaart werkt, inzendingen worden gesynchroniseerd
        </div>
      )}
      {gpsError && (
        <div className="bg-[#FEF3C7] text-[#92400E] px-4 py-2 text-xs text-center shrink-0 flex items-center justify-center gap-1.5">
          <Radio className="w-3.5 h-3.5 shrink-0" />
          {gpsError} · Controleer locatietoegang in browserinstellingen
        </div>
      )}
      {team?.isOutsideGeofence && (
        <div className="bg-red-500 text-white px-4 py-2.5 text-sm text-center font-bold shrink-0 animate-pulse flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          BUITEN SPEELZONE — Keer terug!
        </div>
      )}

      {/* ── VIEWS ── */}
      <div className="flex-1 overflow-hidden relative">

        {activeView === 'map' && (
          <GameMap
            checkpoints={checkpoints}
            teamPosition={position}
            nearbyCheckpoint={nearbyCheckpoint}
            variant={variant}
          />
        )}
        {activeView === 'mission' && activeCheckpoint && (
          <MissionPanel
            checkpoint={activeCheckpoint}
            sessionId={sessionId}
            teamToken={teamToken!}
            isKids={isKids}
            variant={variant}
            onSubmit={handleMissionSubmit}
            onClose={() => setActiveView('map')}
          />
        )}
        {activeView === 'score' && (
          <Scoreboard entries={scoreboard} checkpoints={checkpoints} />
        )}

        {/* ── UNLOCK KNOP ── */}
        {activeView === 'map' && nearbyCheckpoint && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-[1000] px-4">
            <button
              onClick={handleCheckpointUnlock}
              className="w-full max-w-sm py-4 bg-[#00E676] text-[#0F172A] rounded-2xl font-black text-base shadow-2xl shadow-[#00E676]/30 active:scale-95 transition-all animate-bounce flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Checkpoint bereikt — Ontgrendel!
            </button>
          </div>
        )}

        {/* ── CHECKPOINT INFO OVERLAY ── */}
        {activeView === 'map' && currentCheckpoint && !nearbyCheckpoint && (
          <div className="absolute bottom-20 left-4 right-4 z-[1000]">
            <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                  <span className="text-base font-black text-[#00C853]"
                    style={{ fontFamily: 'var(--font-display)' }}>
                    {completedCount + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse inline-block" />
                    <span className="text-[9px] font-bold text-[#00C853] uppercase tracking-widest">
                      Volgend checkpoint
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] truncate">{currentCheckpoint.name}</p>
                </div>
                {position && (
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#0F172A] leading-none"
                      style={{ fontFamily: 'var(--font-display)' }}>
                      {Math.round(haversineDistance(position.latitude, position.longitude, currentCheckpoint.latitude, currentCheckpoint.longitude))}m
                    </p>
                    <p className="text-[9px] text-[#94A3B8] font-semibold uppercase">afstand</p>
                  </div>
                )}
              </div>
              {/* Progress bar checkpoints */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#00E676] rounded-full transition-all"
                    style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#94A3B8] shrink-0">{completedCount}/{totalCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIEVE MISSIE TERUGKNOP ── */}
        {activeView === 'map' && activeCheckpoint && (
          <div className="absolute top-4 right-4 z-[1000]">
            <button
              onClick={() => setActiveView('mission')}
              className="bg-[#0F172A] text-white rounded-full px-3.5 py-2 text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <FileText className="w-3.5 h-3.5" />
              Open missie
            </button>
          </div>
        )}

        {/* ── AI CHAT ── */}
        {!isKids && teamToken && (
          <ChatPanel
            sessionId={sessionId}
            teamToken={teamToken}
            teamName={team?.name ?? ''}
            variant={variant}
            isOpen={chatOpen}
            onOpenChange={setChatOpen}
          />
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="bg-white border-t border-[#E2E8F0] flex shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.disabled) {
                  toast('Loop naar een checkpoint om de missie te starten')
                } else {
                  setChatOpen(false)
                  setActiveView(tab.id)
                }
              }}
              className="flex-1 flex flex-col items-center pt-2.5 pb-2 gap-0.5 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-[#DCFCE7]' : ''}`}>
                <tab.Icon
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-[#00C853]' : tab.disabled ? 'text-[#CBD5E1]' : 'text-[#94A3B8]'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-[#00C853]' : tab.disabled ? 'text-[#CBD5E1]' : 'text-[#94A3B8]'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
