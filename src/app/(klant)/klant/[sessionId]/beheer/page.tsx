'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Play, Pause, Square, Copy, CheckCircle2, Users,
  Trophy, MapPin, Loader2, Navigation, RefreshCw,
  BarChart2, Clock, FlaskConical, X,
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
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-[#F1F5F9] text-[#64748B]',
  lobby: 'bg-blue-50 text-blue-600',
  active: 'bg-[#DCFCE7] text-[#166534]',
  paused: 'bg-amber-50 text-amber-600',
  completed: 'bg-[#F1F5F9] text-[#94A3B8]',
}

const STATUS_NL: Record<string, string> = {
  draft: 'Concept', lobby: 'Lobby open', active: 'Actief', paused: 'Gepauzeerd', completed: 'Afgerond',
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
      // Gebruik de bestaande spelleider sessions API
      const res = await fetch(`/api/sessions/${sessionId}`)
      if (!res.ok) {
        if (res.status === 401) { router.push(`/login?callbackUrl=/klant/${sessionId}/beheer`); return }
        setError('Sessie niet gevonden.')
        return
      }
      const d = await res.json()

      // Haal teams op via de spelleider API
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

  // Onboarding strip: toon eenmalig per sessie
  useEffect(() => {
    if (!sessionId) return
    if (!localStorage.getItem(`beheer_onboarded_${sessionId}`)) setShowOnboarding(true)
  }, [sessionId])

  const dismissOnboarding = () => {
    localStorage.setItem(`beheer_onboarded_${sessionId}`, '1')
    setShowOnboarding(false)
  }

  // Elapsed timer
  useEffect(() => {
    if (!data?.startedAt) return
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(data.startedAt!).getTime()) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [data?.startedAt])

  // Auto-refresh elke 15 seconden
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
    } finally {
      setIsActioning(null)
    }
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
    } finally {
      setIsActioning(null)
    }
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
          <button onClick={() => { setError(''); setIsLoading(true); load() }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-lg font-semibold text-sm mx-auto">
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

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A]">
        <div className="max-w-2xl mx-auto px-6 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex">
              <Image src="/images/IctusGo.png" alt="IctusGo" width={100} height={30} className="h-6 w-auto" />
            </div>
            <div className="flex-1">
              <span className="text-[#00E676] text-xs font-bold uppercase tracking-widest">Game Day Dashboard</span>
            </div>
            <button onClick={load} className="p-2 text-[#475569] hover:text-[#94A3B8] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-1"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
            {data.customSessionName || data.tour?.name || 'Tocht'}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[#64748B] text-sm">
              {VARIANT_LABELS[data.tour?.variant ?? ''] ?? data.tour?.variant}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[data.status] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
              {STATUS_NL[data.status] ?? data.status}
            </span>
            {isActive && data.startedAt && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span className="text-[#00E676] text-sm font-mono font-bold">{formatElapsed(elapsed)}</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { Icon: Users, value: data.teams?.length ?? 0, label: 'teams' },
              { Icon: MapPin, value: data.checkpointCount, label: 'checkpoints' },
              { Icon: Clock, value: `${data.tour?.estimatedDurationMin ?? 120}m`, label: 'duur' },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="bg-[#1E293B] rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-[#00E676] mx-auto mb-1" />
                <div className="text-white font-black text-lg"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                  {value}
                </div>
                <div className="text-[#475569] text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* JOIN CODE kaart */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Teamcode voor deelnemers</p>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 bg-[#F8FAFC] rounded-xl p-4 text-center border border-[#E2E8F0]">
              <p className="text-4xl font-black tracking-[0.3em] text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                {data.joinCode}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => copyToClipboard(data.joinCode, 'code')}
                className="p-3 bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] transition-colors"
              >
                {copied === 'code' ? <CheckCircle2 className="w-5 h-5 text-[#00E676]" /> : <Copy className="w-5 h-5 text-[#64748B]" />}
              </button>
              <button
                onClick={() => copyToClipboard(data.joinLink, 'link')}
                className="p-3 bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] transition-colors"
                title="Kopieer directe link"
              >
                {copied === 'link' ? <CheckCircle2 className="w-5 h-5 text-[#00E676]" /> : <Navigation className="w-5 h-5 text-[#64748B]" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8] text-center">
            Teams gaan naar <strong className="text-[#0F172A]">impacttocht.nl/join</strong> en voeren deze code in
          </p>
        </div>

        {/* ONBOARDING STRIP — eerste keer */}
        {showOnboarding && isLobby && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 animate-fade-in">
            <div className="flex items-start justify-between mb-2.5">
              <p className="text-sm font-bold text-[#1E40AF]">Zo werkt het</p>
              <button onClick={dismissOnboarding} className="text-[#93C5FD] hover:text-[#1E40AF] transition-colors -mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="space-y-2">
              {[
                'Deel de teamcode met deelnemers',
                'Wacht tot alle teams zijn ingelogd',
                'Druk op START DE TOCHT',
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-[#3B82F6]">
                  <span className="w-5 h-5 bg-[#BFDBFE] text-[#1D4ED8] rounded-full text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* HOOFD ACTIEKNOP */}
        {!isCompleted && (
          <div>
            {isLobby && (
              <button
                onClick={() => handleAction('start')}
                disabled={isActioning !== null}
                className="w-full py-6 bg-[#00E676] text-[#0F172A] rounded-2xl font-black text-xl uppercase tracking-wide hover:bg-[#00C853] transition-all disabled:opacity-50 shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-3"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {isActioning === 'start' ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Starten...</>
                ) : (
                  <><Play className="w-6 h-6 fill-current" /> START DE TOCHT</>
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
                  Stoppen
                </button>
              </div>
            )}

            {isPaused && (
              <button
                onClick={() => handleAction('resume')}
                disabled={isActioning !== null}
                className="w-full py-5 bg-[#00E676] text-[#0F172A] rounded-2xl font-black text-lg uppercase tracking-wide hover:bg-[#00C853] transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {isActioning === 'resume' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Hervatten
              </button>
            )}
          </div>
        )}

        {/* Test mode toggle — handig voor demo/testen zonder GPS */}
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
            {isActioning === 'testmode'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FlaskConical className="w-4 h-4" />}
            {data.isTestMode ? '🧪 Test mode AAN — klik om uit te zetten' : 'Test mode (spelen zonder GPS)'}
          </button>
        )}

        {/* Teams live overzicht */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00E676]" />
              Teams live
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
                title="Vernieuwen"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {sortedTeams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-[#E2E8F0] mx-auto mb-2" />
              <p className="text-[#94A3B8] text-sm">Nog geen teams deelgenomen</p>
              <p className="text-[#CBD5E1] text-xs mt-1">Teams melden zich aan met de code hierboven</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedTeams.map((team, i) => {
                const progress = data.checkpointCount > 0
                  ? Math.round((team.currentCheckpointIndex / data.checkpointCount) * 100)
                  : 0
                const isDone = data.checkpointCount > 0 && team.currentCheckpointIndex >= data.checkpointCount
                const isOnline = team.lastPositionAt
                  ? Date.now() - new Date(team.lastPositionAt).getTime() < 120_000
                  : false
                return (
                  <div key={team.id} className={`rounded-xl p-3 border ${team.isOutsideGeofence ? 'border-red-200 bg-red-50' : 'border-[#F1F5F9] bg-[#F8FAFC]'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        i === 0 ? 'bg-[#F59E0B] text-white' :
                        i === 1 ? 'bg-[#94A3B8] text-white' :
                        i === 2 ? 'bg-[#CD7C2F] text-white' :
                        'bg-[#E2E8F0] text-[#64748B]'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isOnline && <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse shrink-0" title="Online" />}
                            <span className="font-semibold text-[#0F172A] text-sm truncate">{team.name}</span>
                          </div>
                          <span className="text-[#00E676] font-black text-sm shrink-0"
                            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                            {team.totalGmsScore} pt
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-[#94A3B8] text-xs">
                            CP {team.currentCheckpointIndex}/{data.checkpointCount}
                          </span>
                          {team.isOutsideGeofence && (
                            <span className="text-xs text-red-600 font-medium">⚠ buiten grens</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Progress bar of Klaar-badge */}
                    {isDone ? (
                      <div className="flex items-center gap-1.5 text-xs text-[#00C853] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Klaar!
                      </div>
                    ) : (
                      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00E676] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Na afloop: resultaten */}
        {isCompleted && (
          <div className="space-y-3">
            <div className="bg-[#0F172A] rounded-2xl p-5 text-center">
              <Trophy className="w-8 h-8 text-[#F59E0B] mx-auto mb-3" />
              <h3 className="text-white font-black text-xl mb-1"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                TOCHT AFGEROND!
              </h3>
              <p className="text-[#64748B] text-sm mb-4">Bekijk de resultaten en download het rapport.</p>
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

        {/* Live monitor link */}
        {(isActive || isPaused) && (
          <button
            onClick={() => router.push(`/spelleider/sessies/${sessionId}`)}
            className="w-full py-3 flex items-center justify-center gap-2 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:border-[#00E676]/40 hover:text-[#0F172A] transition-colors bg-white"
          >
            <BarChart2 className="w-4 h-4" />
            Live GPS monitor openen
          </button>
        )}
      </div>
    </main>
  )
}
