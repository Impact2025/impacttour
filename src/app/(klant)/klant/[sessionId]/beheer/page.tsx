'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Play, Pause, Square, Copy, CheckCircle2, Users,
  Trophy, MapPin, Loader2, Navigation, RefreshCw,
  BarChart2, Clock, FlaskConical, X, Zap,
} from 'lucide-react'

type TeamStatus = {
  id: string
  name: string
  totalGmsScore: number
  currentCheckpointIndex: number
  isActive: boolean
  isOutsideGeofence: boolean
  lastPositionAt?: string | null
}

type BeheerData = {
  id: string
  joinCode: string
  joinLink: string
  status: string
  isTestMode: boolean
  customSessionName: string | null
  scheduledAt: string | null
  tour: { name: string; variant: string; estimatedDurationMin: number } | null
  teams: TeamStatus[]
  checkpointCount: number
  startedAt: string | null
}

const VARIANT_LABELS: Record<string, string> = {
  wijktocht: 'WijkTocht', impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht', jeugdtocht: 'JeugdTocht', voetbalmissie: 'VoetbalMissie',
  vrijwilligersdankdag: 'Vrijwilligers Dankdag', vaartocht: 'VaarTocht',
}

const STATUS_NL: Record<string, string> = {
  draft: 'Concept', lobby: 'Lobby open', active: 'Actief', paused: 'Gepauzeerd', completed: 'Afgerond',
}

const TEAM_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#00C853',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
]

function teamColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return TEAM_COLORS[Math.abs(hash) % TEAM_COLORS.length]
}

function teamInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function BeheerPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [data, setData] = useState<BeheerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [isActioning, setIsActioning] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      if (!res.ok) {
        if (res.status === 401) { router.push(`/login?callbackUrl=/klant/${sessionId}/beheer`); return }
        setError('Sessie niet gevonden.')
        return
      }
      const d = await res.json()

      const teamsRes = await fetch(`/api/sessions/${sessionId}/teams`, { cache: 'no-store' }).catch(() => null)
      const teamsData = teamsRes?.ok ? await teamsRes.json().catch(() => []) : []

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      setData({
        ...d,
        joinLink: `${appUrl}/join?code=${d.joinCode}`,
        isTestMode: d.isTestMode ?? false,
        teams: teamsData,
        checkpointCount: d.tour?.checkpoints?.length ?? 0,
      })
    } catch {
      setError('Kon sessie niet laden.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, router])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!sessionId) return
    if (!localStorage.getItem(`beheer_onboarded_${sessionId}`)) setShowOnboarding(true)
  }, [sessionId])

  const dismissOnboarding = () => {
    localStorage.setItem(`beheer_onboarded_${sessionId}`, '1')
    setShowOnboarding(false)
  }

  useEffect(() => {
    if (!data?.startedAt) return
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(data.startedAt!).getTime()) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [data?.startedAt])

  useEffect(() => {
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const handleToggleTestMode = async () => {
    if (!data) return
    setIsActioning('testmode')
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTestMode: !data.isTestMode }),
      })
      await load()
    } finally { setIsActioning(null) }
  }

  const handleAction = async (action: 'start' | 'pause' | 'resume' | 'complete') => {
    setIsActioning(action)
    const newStatus = action === 'start' ? 'active' : action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'completed'
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      await load()
    } finally { setIsActioning(null) }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#00E676] animate-spin mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">Dashboard laden...</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#64748B] mb-4">{error || 'Sessie niet gevonden.'}</p>
          <button
            onClick={() => { setError(''); setIsLoading(true); load() }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-lg font-semibold text-sm mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Opnieuw
          </button>
        </div>
      </main>
    )
  }

  const isActive = data.status === 'active'
  const isPaused = data.status === 'paused'
  const isLobby = data.status === 'lobby' || data.status === 'draft'
  const isCompleted = data.status === 'completed'
  const sortedTeams = [...(data.teams ?? [])].sort((a, b) => b.totalGmsScore - a.totalGmsScore)
  const teamsReady = sortedTeams.length > 0

  return (
    <main className="min-h-screen bg-[#F8FAFC]">

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0F172A]">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-6">

          {/* Top row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex shrink-0">
              <Image src="/images/IctusGo.png" alt="IctusGo" width={100} height={30} className="h-6 w-auto" />
            </div>
            <div className="flex-1">
              <span className="text-[#00E676] text-xs font-bold uppercase tracking-widest">Game Day</span>
            </div>
            <button onClick={load} className="p-2 text-[#475569] hover:text-[#94A3B8] transition-colors rounded-lg hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Titel + status */}
          <h1
            className="text-3xl font-black text-white leading-tight mb-2"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            {data.customSessionName || data.tour?.name || 'Tocht'}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#64748B] text-sm">
              {VARIANT_LABELS[data.tour?.variant ?? ''] ?? data.tour?.variant}
            </span>
            {/* Live status badge */}
            {isActive ? (
              <div className="flex items-center gap-1.5 bg-[#00E676]/10 border border-[#00E676]/30 px-2.5 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span className="text-[#00E676] text-xs font-bold uppercase tracking-wider">Live</span>
                {data.startedAt && (
                  <span className="text-[#00E676] text-xs font-mono">{formatElapsed(elapsed)}</span>
                )}
              </div>
            ) : (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isLobby ? 'bg-blue-500/15 text-blue-400' :
                isPaused ? 'bg-amber-500/15 text-amber-400' :
                isCompleted ? 'bg-[#1E293B] text-[#64748B]' :
                'bg-[#1E293B] text-[#64748B]'
              }`}>
                {STATUS_NL[data.status] ?? data.status}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { Icon: Users,  value: data.teams?.length ?? 0,              label: 'teams' },
              { Icon: MapPin, value: data.checkpointCount,                  label: 'checkpoints' },
              { Icon: Clock,  value: `${data.tour?.estimatedDurationMin ?? 120}m`, label: 'duur' },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="bg-[#1E293B] rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-[#00E676] mx-auto mb-1" />
                <div
                  className="text-white font-black text-lg"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {value}
                </div>
                <div className="text-[#475569] text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">

        {/* ── Teamcode ───────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#F1F5F9]">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Teamcode voor deelnemers</p>
          </div>
          <div className="p-5">
            <div className="flex items-stretch gap-3 mb-3">
              <div className="flex-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-center py-4">
                <span
                  className="text-4xl font-black tracking-[0.35em] text-[#0F172A]"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {data.joinCode}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => copyToClipboard(data.joinCode, 'code')}
                  className="p-3 bg-[#F1F5F9] rounded-xl hover:bg-[#00E676]/10 hover:text-[#00C853] transition-colors flex items-center justify-center"
                  title="Kopieer code"
                >
                  {copied === 'code' ? <CheckCircle2 className="w-5 h-5 text-[#00C853]" /> : <Copy className="w-5 h-5 text-[#64748B]" />}
                </button>
                <button
                  onClick={() => copyToClipboard(data.joinLink, 'link')}
                  className="p-3 bg-[#F1F5F9] rounded-xl hover:bg-[#00E676]/10 hover:text-[#00C853] transition-colors flex items-center justify-center"
                  title="Kopieer deep-link"
                >
                  {copied === 'link' ? <CheckCircle2 className="w-5 h-5 text-[#00C853]" /> : <Navigation className="w-5 h-5 text-[#64748B]" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-center text-[#94A3B8]">
              Teams gaan naar <strong className="text-[#0F172A]">ictusgo.nl/join</strong> en voeren deze code in
            </p>
          </div>
        </div>

        {/* ── Onboarding strip ────────────────────────────────────────────────────── */}
        {showOnboarding && isLobby && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2.5">
              <p className="text-sm font-bold text-[#1E40AF] flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Zo werkt het
              </p>
              <button onClick={dismissOnboarding} className="text-[#93C5FD] hover:text-[#1E40AF] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="space-y-2">
              {[
                'Deel de teamcode of link met je deelnemers',
                'Wacht tot alle teams zijn ingelogd (zie hieronder)',
                'Druk op START — teams ontvangen direct hun eerste GPS-punt',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#3B82F6]">
                  <span className="w-5 h-5 bg-[#BFDBFE] text-[#1D4ED8] rounded-full text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Actieknop ───────────────────────────────────────────────────────────── */}
        {!isCompleted && (
          <div>
            {isLobby && (
              <button
                onClick={() => handleAction('start')}
                disabled={isActioning !== null}
                className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-3 ${
                  teamsReady
                    ? 'bg-[#00E676] text-[#0F172A] hover:bg-[#00C853] shadow-xl shadow-[#00E676]/25'
                    : 'bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {isActioning === 'start' ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Starten...</>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" />
                    {teamsReady ? `Start de tocht (${sortedTeams.length} team${sortedTeams.length !== 1 ? 's' : ''})` : 'Wachten op teams...'}
                  </>
                )}
              </button>
            )}

            {isActive && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('pause')}
                  disabled={isActioning !== null}
                  className="py-4 bg-amber-400 text-amber-900 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {isActioning === 'pause' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 fill-current" />}
                  Pauzeren
                </button>
                <button
                  onClick={() => handleAction('complete')}
                  disabled={isActioning !== null}
                  className="py-4 bg-[#F1F5F9] text-[#64748B] rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-[#E2E8F0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {isActioning === 'complete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
                  Afronden
                </button>
              </div>
            )}

            {isPaused && (
              <button
                onClick={() => handleAction('resume')}
                disabled={isActioning !== null}
                className="w-full py-5 bg-[#00E676] text-[#0F172A] rounded-2xl font-black text-lg uppercase tracking-wide hover:bg-[#00C853] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {isActioning === 'resume' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Hervatten
              </button>
            )}
          </div>
        )}

        {/* ── Teams live ──────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00E676]" />
              Teams {sortedTeams.length > 0 && <span className="text-[#94A3B8] font-normal">({sortedTeams.length})</span>}
            </h3>
            <div className="flex items-center gap-2">
              {isActive && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                  <span className="text-xs text-[#00C853] font-medium">Live</span>
                </div>
              )}
              <button
                onClick={load}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#94A3B8] hover:text-[#64748B]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {sortedTeams.length === 0 ? (
            <div className="py-12 px-5 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#CBD5E1]" />
              </div>
              <p className="text-[#64748B] font-semibold text-sm">Nog geen teams aangemeld</p>
              <p className="text-[#CBD5E1] text-xs mt-1 max-w-[200px] mx-auto">
                Deel de code <strong className="text-[#94A3B8]">{data.joinCode}</strong> met je deelnemers
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F8FAFC]">
              {sortedTeams.map((team, i) => {
                const progress = data.checkpointCount > 0
                  ? Math.round((team.currentCheckpointIndex / data.checkpointCount) * 100)
                  : 0
                const isDone = data.checkpointCount > 0 && team.currentCheckpointIndex >= data.checkpointCount
                const isOnline = team.lastPositionAt
                  ? Date.now() - new Date(team.lastPositionAt).getTime() < 120_000
                  : false
                const color = teamColor(team.name)

                return (
                  <div
                    key={team.id}
                    className={`px-5 py-3.5 ${team.isOutsideGeofence ? 'bg-red-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 relative"
                        style={{ backgroundColor: color }}
                      >
                        {teamInitials(team.name)}
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00E676] rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Rank badge */}
                            <span className={`text-[10px] font-black shrink-0 ${
                              i === 0 ? 'text-[#F59E0B]' : i === 1 ? 'text-[#94A3B8]' : i === 2 ? 'text-[#CD7C2F]' : 'text-[#CBD5E1]'
                            }`}>
                              #{i + 1}
                            </span>
                            <span className="font-semibold text-[#0F172A] text-sm truncate">{team.name}</span>
                            {team.isOutsideGeofence && (
                              <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded-full shrink-0">
                                buiten grens
                              </span>
                            )}
                          </div>
                          <span
                            className="text-sm font-black shrink-0"
                            style={{ color, fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                          >
                            {team.totalGmsScore} pt
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[#94A3B8] text-xs">
                            CP {team.currentCheckpointIndex}/{data.checkpointCount}
                          </span>
                          {isDone ? (
                            <div className="flex items-center gap-1 text-xs text-[#00C853] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Klaar!
                            </div>
                          ) : (
                            <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${progress}%`, backgroundColor: color }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Test mode toggle ──────────────────────────────────────────────────── */}
        {!isCompleted && (
          <button
            onClick={handleToggleTestMode}
            disabled={isActioning !== null}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-colors ${
              data.isTestMode
                ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] hover:bg-[#FDE68A]'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'
            }`}
          >
            {isActioning === 'testmode' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            {data.isTestMode ? 'Test mode AAN — klik om uit te zetten' : 'Test mode (spelen zonder GPS)'}
          </button>
        )}

        {/* ── Live monitor link ─────────────────────────────────────────────────── */}
        {(isActive || isPaused) && (
          <button
            onClick={() => router.push(`/spelleider/sessies/${sessionId}`)}
            className="w-full py-3 flex items-center justify-center gap-2 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:border-[#00E676]/40 hover:text-[#0F172A] transition-colors bg-white"
          >
            <BarChart2 className="w-4 h-4" />
            Live GPS monitor openen
          </button>
        )}

        {/* ── Na afloop ────────────────────────────────────────────────────────────── */}
        {isCompleted && (
          <div className="bg-[#0F172A] rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#F59E0B] to-[#00E676]" />
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-[#F59E0B]/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-7 h-7 text-[#F59E0B]" />
              </div>
              <h3
                className="text-white font-black text-2xl mb-1"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Tocht afgerond!
              </h3>
              <p className="text-[#64748B] text-sm mb-5">
                {sortedTeams.length} team{sortedTeams.length !== 1 ? 's' : ''} hebben deelgenomen.
                Bekijk de resultaten en download het rapport.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/klant/${sessionId}/resultaten`)}
                  className="flex-1 py-3 bg-[#00E676] text-[#0F172A] rounded-xl font-bold text-sm hover:bg-[#00C853] transition-colors"
                >
                  Resultaten bekijken
                </button>
                <button
                  onClick={() => router.push(`/spelleider/sessies/${sessionId}`)}
                  className="flex-1 py-3 bg-[#1E293B] text-[#CBD5E1] rounded-xl font-bold text-sm hover:bg-[#2D3F54] transition-colors"
                >
                  Volledig rapport
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
