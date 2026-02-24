'use client'

import { useEffect, useState, useCallback, useReducer, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import {
  Map, FileText, BarChart2, Target, Clock, Pause, Trophy, Flag,
  AlertTriangle, WifiOff, Radio, Navigation, Zap, Sparkles,
} from 'lucide-react'
import { useGPS, type GPSPosition } from '@/hooks/use-gps'
import { usePusherChannel } from '@/hooks/use-pusher-channel'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { haversineDistance } from '@/lib/geo'
import { MissionPanel } from './mission-panel'
import { Scoreboard } from './scoreboard'
import { ImpactPanel } from './impact-panel'
import { ChatPanel } from './chat-panel'
import { CelebrationOverlay } from '@/components/game/celebration-overlay'

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
  bonusPoints: number
  checkpointsDone: number
  isCurrentTeam: boolean
}

type GameView = 'map' | 'mission' | 'score' | 'impact'

// ─── Session state reducer ────────────────────────────────────────────────────
// Consolideert 9 losse useState hooks → 1 useReducer om onnodige re-renders te beperken.

interface SessionState {
  status: string
  joinCode: string
  variant: string
  tourName: string
  storyFrame: { introText: string; finaleReveal: string } | null
  checkpoints: CheckpointInfo[]
  team: TeamInfo | null
  scoreboard: ScoreboardEntry[]
  isTestMode: boolean
}

type SessionAction =
  | { type: 'LOAD'; payload: Partial<SessionState> }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'SET_SCOREBOARD'; payload: ScoreboardEntry[] }

const initialSession: SessionState = {
  status: 'active',
  joinCode: '',
  variant: 'wijktocht',
  tourName: '',
  storyFrame: null,
  checkpoints: [],
  team: null,
  scoreboard: [],
  isTestMode: false,
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload }
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_SCOREBOARD':
      return { ...state, scoreboard: action.payload }
    default:
      return state
  }
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const isOnline = useOnlineStatus()
  // Session-data: één reducer → één re-render bij data-load ipv 9 afzonderlijke
  const [session, dispatchSession] = useReducer(sessionReducer, initialSession)
  const { status: sessionStatus, joinCode, variant, tourName, storyFrame, checkpoints, team, scoreboard, isTestMode } = session
  // scoreboardRef voor gebruik in Pusher callback (voorkomt stale-closure probleem)
  const scoreboardRef = useRef(scoreboard)
  useEffect(() => { scoreboardRef.current = scoreboard }, [scoreboard])

  // UI state (bewust apart — verandert onafhankelijk van session data)
  const [teamToken, setTeamToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<GameView>('map')
  const [chatOpen, setChatOpen] = useState(false)
  const [nearbyCheckpoint, setNearbyCheckpoint] = useState<CheckpointInfo | null>(null)
  const [activeCheckpoint, setActiveCheckpoint] = useState<CheckpointInfo | null>(null)
  const [isUnlockCelebrating, setIsUnlockCelebrating] = useState(false)
  const [celebratingCheckpoint, setCelebratingCheckpoint] = useState<CheckpointInfo | null>(null)
  const [celebrationScore, setCelebrationScore] = useState(0)

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
        if (isTestMode) {
          setNearbyCheckpoint(current)
        } else {
          const dist = haversineDistance(pos.latitude, pos.longitude, current.latitude, current.longitude)
          setNearbyCheckpoint(dist <= current.unlockRadiusMeters ? current : null)
        }
      },
      [sessionId, teamToken, team, checkpoints, isTestMode]
    ),
    minDistance: 3,
    maxAccuracy: 50,
  })

  usePusherChannel(
    sessionId,
    {
      'score-update': (data) => {
        dispatchSession({
          type: 'SET_SCOREBOARD',
          payload: scoreboardRef.current
            .map((s) => s.teamName === data.teamName ? { ...s, totalGmsScore: data.totalGmsScore } : s)
            .sort((a, b) => b.totalGmsScore - a.totalGmsScore || a.teamName.localeCompare(b.teamName))
            .map((s, idx) => ({ ...s, rank: idx + 1 })),
        })
      },
      'checkpoint-unlocked': (data) => {
        toast.success(`${data.teamName} voltooide checkpoint ${data.checkpointIndex + 1}!`, { duration: 3000 })
      },
      'session-status': (data) => {
        dispatchSession({ type: 'SET_STATUS', payload: data.status })
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
        // Één dispatch voor alle session data → één re-render
        dispatchSession({
          type: 'LOAD',
          payload: {
            status: data.status,
            variant: data.variant,
            tourName: data.tour?.name ?? '',
            storyFrame: data.tour?.storyFrame ?? null,
            joinCode: data.joinCode ?? '',
            isTestMode: data.isTestMode ?? false,
            checkpoints: data.checkpoints ?? [],
            team: data.team,
            scoreboard: data.scoreboard ?? [],
          },
        })
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

  // Test mode: unlock knop direct tonen zonder GPS beweging
  useEffect(() => {
    if (!isTestMode) return
    const current = checkpoints.find((c) => c.isCurrent)
    setNearbyCheckpoint(current ?? null)
  }, [isTestMode, checkpoints])

  const handleCheckpointUnlock = async () => {
    if (!nearbyCheckpoint || !teamToken) return
    // In test mode mag je unlocken zonder GPS; gebruik checkpoint-coördinaten als fallback
    const lat = position?.latitude ?? nearbyCheckpoint.latitude
    const lng = position?.longitude ?? nearbyCheckpoint.longitude
    try {
      const res = await fetch('/api/game/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, teamToken, checkpointId: nearbyCheckpoint.id, latitude: lat, longitude: lng }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Unlock mislukt'); return }
      const cpToShow = nearbyCheckpoint
      setNearbyCheckpoint(null)
      setCelebratingCheckpoint(cpToShow)
      setIsUnlockCelebrating(true)
      // Refresh game data in background during celebration
      fetch(`/api/game/session/${sessionId}`, { headers: { 'x-team-token': teamToken } })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d) {
            const newScore = d.team?.totalGmsScore ?? 0
            const oldScore = team?.totalGmsScore ?? 0
            dispatchSession({
              type: 'LOAD',
              payload: { checkpoints: d.checkpoints ?? [], team: d.team, scoreboard: d.scoreboard ?? [] },
            })
            setCelebrationScore(Math.max(0, newScore - oldScore))
          }
        })
        .catch(() => {})
    } catch {
      toast.error('Verbindingsfout')
    }
  }

  const handleMissionSubmit = async (answer: string, photoUrl?: string) => {
    if (!activeCheckpoint || !teamToken) return null
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, teamToken, checkpointId: activeCheckpoint.id, answer: answer || undefined, photoUrl: photoUrl || undefined }),
        signal: controller.signal,
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Inzending mislukt'); return null }
      const refresh = await fetch(`/api/game/session/${sessionId}`, { headers: { 'x-team-token': teamToken } })
      if (refresh.ok) {
        const d = await refresh.json()
        dispatchSession({
          type: 'LOAD',
          payload: { checkpoints: d.checkpoints ?? [], team: d.team, scoreboard: d.scoreboard ?? [] },
        })
      }
      return data.submission
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error('AI beoordeling duurt te lang — probeer opnieuw')
      } else {
        toast.error('Verbindingsfout bij inzenden')
      }
      return null
    } finally {
      clearTimeout(timeout)
    }
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
          {[0, 1, 2, 3].map((i) => (
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
    { id: 'impact' as GameView, label: 'Impact', Icon: Sparkles },
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

          {/* Rechts: badges + score */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* LIVE badge */}
            <span className="flex items-center gap-1 text-[9px] font-bold text-white bg-[#EF4444] px-2 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              LIVE
            </span>
            {isTestMode && (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full">
                🧪 TEST
              </span>
            )}
            {!isTestMode && gpsError ? (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full">
                <Radio className="w-3 h-3" /> GPS: off
              </span>
            ) : !isTestMode && isWatching ? (
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
          Locatie niet beschikbaar — controleer je browserinstellingen
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
        {activeView === 'impact' && teamToken && (
          <ImpactPanel sessionId={sessionId} teamToken={teamToken} />
        )}

        {/* ── UNLOCK KNOP ── */}
        {activeView === 'map' && nearbyCheckpoint && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-[1000] px-4">
            <button
              onClick={handleCheckpointUnlock}
              className="w-full max-w-sm py-4 bg-[#00E676] text-[#0F172A] rounded-2xl font-black italic text-lg active:scale-95 transition-all animate-bounce flex items-center justify-center gap-2.5 uppercase tracking-wide"
              style={{
                fontFamily: 'var(--font-display)',
                boxShadow: '0 0 0 4px rgba(0,230,118,0.25), 0 8px 32px rgba(0,230,118,0.40)',
              }}
            >
              <Zap className="w-5 h-5" fill="#0F172A" />
              Checkpoint bereikt — Ontgrendel!
            </button>
          </div>
        )}

        {/* ── CHECKPOINT INFO OVERLAY ── */}
        {activeView === 'map' && currentCheckpoint && !nearbyCheckpoint && (
          <div className="absolute bottom-20 left-4 right-4 z-[1000]">
            <div
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 6px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-3">
                {/* Checkpoint nummer */}
                <div className="w-11 h-11 rounded-xl bg-[#0F172A] flex items-center justify-center shrink-0">
                  <span
                    className="text-lg font-black text-[#00E676]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {completedCount + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00C853]" />
                    </span>
                    <span className="text-[9px] font-bold text-[#00C853] uppercase tracking-widest">
                      Volgend checkpoint
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#0F172A] truncate"
                    style={{ fontFamily: 'var(--font-display)' }}>
                    {currentCheckpoint.name}
                  </p>
                </div>
                {position && (
                  <div className="text-right shrink-0">
                    <p
                      className="text-2xl font-black text-[#0F172A] leading-none"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {Math.round(haversineDistance(position.latitude, position.longitude, currentCheckpoint.latitude, currentCheckpoint.longitude))}
                    </p>
                    <p className="text-[9px] text-[#94A3B8] font-semibold uppercase">meter</p>
                  </div>
                )}
              </div>
              {/* Voortgangsbalk */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#00E676] rounded-full transition-all duration-500"
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

        {/* ── UNLOCK CELEBRATION OVERLAY ── */}
        <CelebrationOverlay
          checkpoint={isUnlockCelebrating ? celebratingCheckpoint : null}
          earnedScore={celebrationScore}
          onOpenMission={() => {
            setIsUnlockCelebrating(false)
            if (celebratingCheckpoint) {
              setActiveCheckpoint(celebratingCheckpoint)
              setActiveView('mission')
            }
          }}
        />

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
