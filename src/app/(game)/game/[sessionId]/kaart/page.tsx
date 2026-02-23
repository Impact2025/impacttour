'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { List, Map, RefreshCw, MapPin, Clock, Star, ChevronRight } from 'lucide-react'
import { MobileShell } from '@/components/layout/mobile-shell'
import { BottomNav } from '@/components/ui/bottom-nav'
import { PageHeader } from '@/components/layout/page-header'
import { haversineDistance } from '@/lib/geo'
import type { CheckpointInfo, TeamInfo } from '../page'

const GameMap = dynamic(() => import('../game-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F0FDF4]">
      <div className="w-8 h-8 border-2 border-[#CBD5E1] border-t-[#00E676] rounded-full animate-spin mx-auto" />
    </div>
  ),
})

type KaartTab = 'kaart' | 'lijst'

function formatElapsed(startedAtStr: string | null): string {
  if (!startedAtStr) return '—'
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

  const stats = [
    { icon: <MapPin className="w-5 h-5 text-[#00C853]" />, value: distanceKm, label: 'KM GELOPEN' },
    { icon: <Clock className="w-5 h-5 text-[#00C853]" />, value: elapsedStr, label: 'MINUTEN' },
    { icon: <Star className="w-5 h-5 text-[#00C853]" />, value: `${completedCount}/${totalCount}`, label: 'PUNTEN' },
  ]

  if (isLoading) {
    return (
      <MobileShell withBottomNav className="bg-[#F0FDF4]">
        <PageHeader title="Missie Locaties" />
        <div className="flex-1 px-4 pt-3 space-y-3">
          <div className="h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="rounded-2xl bg-gray-200 animate-pulse" style={{ height: 280 }} />
          <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
        <BottomNav activeTab="stats" variant="simple" />
      </MobileShell>
    )
  }

  if (error) {
    return (
      <MobileShell withBottomNav className="bg-[#F0FDF4]">
        <PageHeader title="Missie Locaties" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-[#64748B] text-sm text-center">{error}</p>
          <button
            onClick={() => { setIsLoading(true); load() }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00E676] text-[#0F172A] rounded-xl font-semibold text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Opnieuw proberen
          </button>
        </div>
        <BottomNav activeTab="stats" variant="simple" />
      </MobileShell>
    )
  }

  return (
    <MobileShell withBottomNav className="bg-[#F0FDF4]">
      <PageHeader title="Missie Locaties" />

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-3">

        {/* Tab switcher — iOS segmented control */}
        <div className="bg-[#E8F5E9] rounded-full p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('kaart')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === 'kaart' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Kaart
          </button>
          <button
            onClick={() => setActiveTab('lijst')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === 'lijst' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lijst
          </button>
        </div>

        {activeTab === 'kaart' && (
          <>
            {/* Kaart card */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-md bg-white"
              style={{ height: 280 }}
            >
              <GameMap
                checkpoints={checkpoints}
                teamPosition={null}
                nearbyCheckpoint={null}
                variant={variant}
              />
            </div>

            {/* Huidige locatie card */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse inline-block" />
                    <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-widest">
                      Huidige Locatie
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#0F172A] leading-tight truncate">
                    {currentCheckpoint?.name ?? 'Alle checkpoints voltooid!'}
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Hoofdlocatie &bull; {completedCount}/{totalCount} Checkpoints
                  </p>
                </div>
                <button className="shrink-0 flex items-center gap-1 bg-[#00E676] text-[#0F172A] text-sm font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-3 flex flex-col items-center gap-1">
                  {s.icon}
                  <span
                    className="text-xl font-extrabold text-[#0F172A] leading-none"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wide text-center leading-tight">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'lijst' && (
          <div className="space-y-2">
            {checkpoints.map((cp, i) => (
              <div
                key={cp.id}
                className={`rounded-2xl p-4 flex items-center gap-3 bg-white border transition-opacity ${
                  cp.isCurrent ? 'border-[#00E676]' : 'border-transparent'
                } ${!cp.isCurrent && !cp.isCompleted ? 'opacity-50' : ''}`}
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    cp.isCompleted
                      ? 'bg-[#00E676] text-[#0F172A]'
                      : cp.isCurrent
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-[#E2E8F0] text-[#94A3B8]'
                  }`}
                >
                  {cp.isCompleted ? '✓' : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      cp.isCompleted ? 'text-[#94A3B8] line-through' : 'text-[#0F172A]'
                    }`}
                  >
                    {cp.name}
                  </p>
                  {cp.missionTitle && (
                    <p className="text-xs text-[#94A3B8] truncate">{cp.missionTitle}</p>
                  )}
                </div>
                {cp.isCurrent && (
                  <span className="text-[10px] font-bold text-[#00C853] bg-[#DCFCE7] px-2 py-0.5 rounded-full shrink-0">
                    NU
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="stats" variant="simple" />
    </MobileShell>
  )
}
