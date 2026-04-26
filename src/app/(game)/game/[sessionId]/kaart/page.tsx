'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { List, Map, RefreshCw, MapPin, Clock, Flag, ArrowUp, CheckCircle2 } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { PageHeader } from '@/components/layout/page-header'
import { haversineDistance, calculateBearing, bearingToCardinal } from '@/lib/geo'
import { useGPS } from '@/hooks/use-gps'
import type { CheckpointInfo, TeamInfo } from '../page'

const GameMap = dynamic(() => import('../game-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#E8F5E9]">
      <div className="w-8 h-8 border-2 border-[#CBD5E1] border-t-[#00E676] rounded-full animate-spin" />
    </div>
  ),
})

type KaartTab = 'kaart' | 'lijst'

function formatElapsed(startedAtStr: string | null): string {
  if (!startedAtStr) return '0'
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(startedAtStr).getTime()) / 60000))
  if (diffMin < 60) return String(diffMin)
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return m > 0 ? `${h}u${m}` : `${h}u`
}

function calcDistanceKm(checkpoints: CheckpointInfo[], completedIds: string[]): string {
  const done = checkpoints
    .filter((c) => completedIds.includes(c.id))
    .sort((a, b) => a.orderIndex - b.orderIndex)
  if (done.length < 2) return '0.0'
  let m = 0
  for (let i = 1; i < done.length; i++) {
    m += haversineDistance(done[i - 1].latitude, done[i - 1].longitude, done[i].latitude, done[i].longitude)
  }
  return (m / 1000).toFixed(1)
}

export default function KaartPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [activeTab, setActiveTab] = useState<KaartTab>('kaart')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkpoints, setCheckpoints] = useState<CheckpointInfo[]>([])
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [variant, setVariant] = useState<string>('wijktocht')

  // GPS tracking voor live navigatie
  const { position: teamPosition, startWatching } = useGPS({ minDistance: 3, maxAccuracy: 50 })
  useEffect(() => { startWatching() }, [startWatching])

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
      const data = await res.json()
      setCheckpoints(data.checkpoints ?? [])
      setTeam(data.team)
      if (data.variant) setVariant(data.variant)
    } catch {
      setError('Kan data niet laden. Controleer je verbinding.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, router])

  useEffect(() => { load() }, [load])

  const currentCheckpoint = checkpoints.find((c) => c.isCurrent)
  const completedIds = (team?.completedCheckpoints as string[]) ?? []
  const completedCount = completedIds.length
  const totalCount = checkpoints.length
  const startedAt = typeof window !== 'undefined' ? sessionStorage.getItem('startedAt') : null
  const distanceKm = calcDistanceKm(checkpoints, completedIds)
  const elapsedStr = formatElapsed(startedAt)

  // Bearing + afstand naar huidig checkpoint
  const bearing = useMemo(() => {
    if (!teamPosition || !currentCheckpoint) return null
    return calculateBearing(
      teamPosition.latitude, teamPosition.longitude,
      currentCheckpoint.latitude, currentCheckpoint.longitude
    )
  }, [teamPosition, currentCheckpoint])

  const distanceToCheckpoint = useMemo(() => {
    if (!teamPosition || !currentCheckpoint) return null
    return haversineDistance(
      teamPosition.latitude, teamPosition.longitude,
      currentCheckpoint.latitude, currentCheckpoint.longitude
    )
  }, [teamPosition, currentCheckpoint])

  const cardinal = bearing !== null ? bearingToCardinal(bearing) : null
  const isApproaching = distanceToCheckpoint !== null && distanceToCheckpoint < 150

  // Haptic bij naderen checkpoint (< 150m)
  const lastDistRef = useRef<number | null>(null)
  useEffect(() => {
    if (distanceToCheckpoint === null) return
    const prev = lastDistRef.current
    if (prev !== null && prev > 150 && distanceToCheckpoint <= 150) {
      if (document.hasFocus()) navigator.vibrate?.([50, 30, 50])
    }
    lastDistRef.current = distanceToCheckpoint
  }, [distanceToCheckpoint])

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
        <PageHeader title="Missie Locaties" />
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="h-10 bg-[#E2E8F0] rounded-full animate-pulse" />
        </div>
        <div className="flex-1 mx-4 rounded-2xl bg-[#E2E8F0] animate-pulse min-h-0" />
        <div
          className="px-4 pt-3 shrink-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          <div className="h-32 bg-[#E2E8F0] rounded-2xl animate-pulse" />
        </div>
        <BottomNav activeTab="stats" variant="simple" />
      </div>
    )
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
        <PageHeader title="Missie Locaties" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-[#64748B] text-sm text-center">{error}</p>
          <button
            onClick={() => { setIsLoading(true); load() }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00E676] text-[#0F172A] rounded-xl font-semibold text-sm active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            Opnieuw proberen
          </button>
        </div>
        <BottomNav activeTab="stats" variant="simple" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      <PageHeader title="Missie Locaties" />

      {/* ── TAB SWITCHER ── */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="bg-[#E8F5E9] rounded-full p-1 flex">
          {(['kaart', 'lijst'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B]'
              }`}
            >
              {tab === 'kaart' ? <Map className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              {tab === 'kaart' ? 'Kaart' : 'Lijst'}
            </button>
          ))}
        </div>
      </div>

      {/* ── KAART TAB ── */}
      {activeTab === 'kaart' && (
        <>
          {/* Map — vult alle resterende ruimte */}
          <div className="flex-1 mx-4 rounded-2xl overflow-hidden min-h-0"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <GameMap
              checkpoints={checkpoints}
              teamPosition={teamPosition}
              nearbyCheckpoint={null}
              variant={variant}
            />
          </div>

          {/* ── BOTTOM SHEET + STAT CARDS ── */}
          <div
            className="px-4 pt-3 shrink-0 space-y-3"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
          >
            {/* NavigationCard */}
            {isApproaching ? (
              /* Bijna er! — groene card */
              <div
                className="bg-[#DCFCE7] rounded-2xl px-5 py-4"
                style={{ boxShadow: '0 4px 20px rgba(0,230,118,0.20)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00E676] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#0F172A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[17px] font-black text-[#0F172A] leading-tight"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                    >
                      Je bent er bijna!
                    </p>
                    <p className="text-sm text-[#16A34A] mt-0.5">
                      {Math.round(distanceToCheckpoint!)}m · {currentCheckpoint?.name}
                    </p>
                  </div>
                </div>
                {currentCheckpoint?.navigationHint && (
                  <div className="mt-3 flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2.5">
                    <MapPin className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#15803D] font-medium leading-snug">
                      {currentCheckpoint.navigationHint}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Bearing card — dark navy */
              <div
                className="bg-[#0F172A] rounded-2xl px-5 py-5"
                style={{ boxShadow: '0 4px 28px rgba(0,0,0,0.25)' }}
              >
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-3">
                  Richting volgende stop
                </p>
                <div className="flex items-center gap-5">
                  {/* Roterende pijl */}
                  <div
                    className="w-16 h-16 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center shrink-0 transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${bearing ?? 0}deg)` }}
                  >
                    <ArrowUp className="w-8 h-8 text-[#00E676]" />
                  </div>

                  {/* Richting + afstand + naam */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-[32px] font-black text-white leading-none"
                        style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                      >
                        {teamPosition ? (cardinal ?? '—') : '—'}
                      </span>
                      {distanceToCheckpoint !== null && (
                        <span className="text-[#00E676] font-bold text-xl leading-none">
                          {distanceToCheckpoint < 1000
                            ? `${Math.round(distanceToCheckpoint)}m`
                            : `${(distanceToCheckpoint / 1000).toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    <p className="text-[#64748B] text-sm mt-1 truncate">
                      {currentCheckpoint?.name ?? 'Tocht voltooid'}
                    </p>
                    {currentCheckpoint?.navigationHint && (
                      <p className="text-[#94A3B8] text-xs mt-1.5 leading-snug line-clamp-2">
                        📍 {currentCheckpoint.navigationHint}
                      </p>
                    )}
                    {!teamPosition && (
                      <p className="text-[#475569] text-xs mt-1.5">
                        GPS laden… sta locatietoegang toe
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Aparte stat cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { Icon: MapPin, value: distanceKm, label: 'KM GELOPEN' },
                { Icon: Clock, value: elapsedStr, label: 'MINUTEN' },
                { Icon: Flag, value: `${completedCount}/${totalCount}`, label: 'PUNTEN' },
              ].map(({ Icon, value, label }, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl py-4 flex flex-col items-center gap-1"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
                >
                  <Icon className="w-4 h-4 text-[#00C853]" />
                  <span
                    className="text-[22px] font-black text-[#0F172A] leading-none mt-0.5"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {value}
                  </span>
                  <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── LIJST TAB ── */}
      {activeTab === 'lijst' && (
        <div
          className="flex-1 overflow-y-auto px-4 pt-1 space-y-2"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          {checkpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#94A3B8]">
              <MapPin className="w-8 h-8" />
              <p className="text-sm">Geen checkpoints beschikbaar</p>
            </div>
          ) : (
            checkpoints.map((cp, i) => {
              const isCompleted = completedIds.includes(cp.id)
              const isCurrent = cp.isCurrent
              return (
                <div
                  key={cp.id}
                  className={`flex items-center gap-3 bg-white rounded-2xl p-4 transition-all duration-200 ${
                    !isCurrent && !isCompleted ? 'opacity-40' : ''
                  }`}
                  style={{
                    boxShadow: isCurrent
                      ? '0 2px 16px rgba(0,230,118,0.20), 0 1px 4px rgba(0,0,0,0.05)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Nummer badge */}
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-[#00E676] text-[#0F172A]'
                        : isCurrent
                        ? 'bg-[#0F172A] text-white'
                        : 'bg-[#F1F5F9] text-[#94A3B8]'
                    }`}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </span>

                  {/* Naam + missie */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCompleted
                          ? 'text-[#94A3B8] line-through'
                          : isCurrent
                          ? 'text-[#0F172A] font-bold'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {cp.name}
                    </p>
                    {cp.missionTitle && (
                      <p className="text-xs text-[#94A3B8] truncate mt-0.5">{cp.missionTitle}</p>
                    )}
                    {isCurrent && cp.navigationHint && (
                      <p className="text-xs text-[#16A34A] mt-1 leading-snug line-clamp-2">
                        📍 {cp.navigationHint}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#00C853] bg-[#DCFCE7] px-2.5 py-1 rounded-full shrink-0">
                      NU
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      <BottomNav activeTab="stats" variant="simple" />
    </div>
  )
}
