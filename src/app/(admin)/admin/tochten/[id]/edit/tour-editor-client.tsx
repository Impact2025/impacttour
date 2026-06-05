'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import {
  ChevronUp, ChevronDown, Trash2, Plus, Save, Loader2,
  MapPin, Target, MessageSquare, Lightbulb, Clock, Star,
} from 'lucide-react'
import { VARIANT_OPTIONS, CHECKPOINT_TYPE_OPTIONS, MISSION_TYPE_OPTIONS } from '@/lib/admin-constants'
import type { MapCheckpoint } from './admin-checkpoint-map'

const CheckpointMap = dynamic(() => import('./admin-checkpoint-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center text-[#94A3B8]">
        <div className="w-8 h-8 border-2 border-[#E2E8F0] border-t-[#00E676] rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">Kaart laden...</p>
      </div>
    </div>
  ),
})

export interface CheckpointData {
  id: string
  orderIndex: number
  name: string
  description: string | null
  type: string
  latitude: number
  longitude: number
  unlockRadiusMeters: number
  missionTitle: string
  missionDescription: string
  missionType: string
  navigationHint: string | null
  gmsConnection: number
  gmsMeaning: number
  gmsJoy: number
  gmsGrowth: number
  hint1: string | null
  hint2: string | null
  hint3: string | null
  timeLimitSeconds: number | null
  bonusPhotoPoints: number
  isKidsFriendly: boolean
}

export interface TourData {
  id: string
  name: string
  description: string | null
  variant: string
  estimatedDurationMin: number | null
  maxTeams: number | null
  priceInCents: number
  pricingModel: string
  pricePerPersonCents: number
  storyFrame: { introText?: string; finaleReveal?: string } | null
  isPublished: boolean
}

interface Props {
  tour: TourData
  initialCheckpoints: CheckpointData[]
}

type Tab = 'info' | 'checkpoints'

const inputCls = "w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676]"
const labelCls = "block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide"

function GmsSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#64748B]">{label}</span>
        <span className="text-xs font-bold text-[#0F172A] w-6 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={25}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-[#E2E8F0] cursor-pointer accent-[#00E676]"
      />
    </div>
  )
}

export function TourEditorClient({ tour, initialCheckpoints }: Props) {
  const [tourData, setTourData] = useState<TourData>(tour)
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>(initialCheckpoints)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('checkpoints')
  const [savingTour, setSavingTour] = useState(false)
  const [savingCp, setSavingCp] = useState(false)
  const [addingCp, setAddingCp] = useState(false)

  // ─── Tour info save ────────────────────────────────────────────────────────

  const saveTourInfo = async () => {
    setSavingTour(true)
    try {
      const res = await fetch(`/api/admin/tochten/${tour.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tourData.name,
          description: tourData.description,
          variant: tourData.variant,
          estimatedDurationMin: tourData.estimatedDurationMin,
          maxTeams: tourData.maxTeams,
          priceInCents: tourData.priceInCents,
          pricingModel: tourData.pricingModel,
          pricePerPersonCents: tourData.pricePerPersonCents,
          storyFrame: tourData.storyFrame,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Opslaan mislukt')
      } else {
        toast.success('Tocht-info opgeslagen')
      }
    } catch {
      toast.error('Verbindingsfout')
    } finally {
      setSavingTour(false)
    }
  }

  // ─── Checkpoint save ───────────────────────────────────────────────────────

  const saveCheckpoint = async (cp: CheckpointData) => {
    setSavingCp(true)
    try {
      const res = await fetch(`/api/admin/checkpoints/${cp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cp),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Opslaan mislukt')
      } else {
        const data = await res.json()
        setCheckpoints(prev => prev.map(c => c.id === cp.id ? data.checkpoint : c))
        toast.success('Checkpoint opgeslagen')
      }
    } catch {
      toast.error('Verbindingsfout')
    } finally {
      setSavingCp(false)
    }
  }

  // ─── Map callbacks ─────────────────────────────────────────────────────────

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!selectedId) return
    setCheckpoints(prev => prev.map(c => c.id === selectedId ? { ...c, latitude: lat, longitude: lng } : c))
  }, [selectedId])

  const handleMarkerDrag = useCallback((id: string, lat: number, lng: number) => {
    setCheckpoints(prev => prev.map(c => c.id === id ? { ...c, latitude: lat, longitude: lng } : c))
  }, [])

  // ─── Checkpoint actions ────────────────────────────────────────────────────

  const addCheckpoint = async () => {
    setAddingCp(true)
    const center = checkpoints.length > 0
      ? { lat: checkpoints[checkpoints.length - 1].latitude, lng: checkpoints[checkpoints.length - 1].longitude }
      : { lat: 52.3702, lng: 4.8952 }
    try {
      const res = await fetch(`/api/admin/tochten/${tour.id}/checkpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: center.lat, longitude: center.lng }),
      })
      if (!res.ok) { toast.error('Toevoegen mislukt'); return }
      const data = await res.json()
      setCheckpoints(prev => [...prev, data.checkpoint])
      setSelectedId(data.checkpoint.id)
      setTab('checkpoints')
      toast.success('Nieuw checkpoint toegevoegd')
    } catch {
      toast.error('Verbindingsfout')
    } finally {
      setAddingCp(false)
    }
  }

  const moveCheckpoint = async (id: string, direction: 'up' | 'down') => {
    const res = await fetch(`/api/admin/checkpoints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: direction === 'up' ? 'move_up' : 'move_down' }),
    })
    if (res.ok) {
      const data = await res.json()
      setCheckpoints(data.checkpoints)
    }
  }

  const deleteCheckpoint = async (id: string) => {
    if (!window.confirm('Checkpoint verwijderen?')) return
    const res = await fetch(`/api/admin/checkpoints/${id}`, { method: 'DELETE' })
    if (res.ok) {
      const data = await res.json()
      setCheckpoints(data.checkpoints)
      if (selectedId === id) setSelectedId(null)
      toast.success('Checkpoint verwijderd')
    } else {
      toast.error('Verwijderen mislukt')
    }
  }

  const updateSelected = (patch: Partial<CheckpointData>) => {
    if (!selectedId) return
    setCheckpoints(prev => prev.map(c => c.id === selectedId ? { ...c, ...patch } : c))
  }

  const mapCheckpoints: MapCheckpoint[] = checkpoints.map(c => ({
    id: c.id,
    name: c.name,
    orderIndex: c.orderIndex,
    latitude: c.latitude,
    longitude: c.longitude,
    unlockRadiusMeters: c.unlockRadiusMeters,
  }))

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Left panel */}
      <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-[#E2E8F0]">
        {/* Tabs */}
        <div className="flex border-b border-[#E2E8F0] flex-shrink-0">
          {(['checkpoints', 'info'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-[#0F172A] border-b-2 border-[#00E676]'
                  : 'text-[#94A3B8] hover:text-[#64748B]'
              }`}
            >
              {t === 'checkpoints' ? `Checkpoints (${checkpoints.length})` : 'Tocht info'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── Checkpoints tab ── */}
          {tab === 'checkpoints' && (
            <div>
              {/* Checkpoint list */}
              <div className="divide-y divide-[#F8FAFC]">
                {checkpoints.length === 0 && (
                  <div className="px-5 py-8 text-center text-[#94A3B8] text-sm">
                    Nog geen checkpoints. Klik op &quot;Nieuw checkpoint&quot; om te beginnen.
                  </div>
                )}
                {checkpoints.map((cp, idx) => (
                  <div
                    key={cp.id}
                    className={`cursor-pointer transition-colors ${
                      selectedId === cp.id ? 'bg-[#F0FDF4]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {/* Checkpoint header row */}
                    <div
                      className="flex items-center gap-3 px-4 py-3"
                      onClick={() => setSelectedId(selectedId === cp.id ? null : cp.id)}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selectedId === cp.id ? 'bg-[#00E676] text-[#0F172A]' : 'bg-[#0F172A] text-white'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{cp.name}</p>
                        <p className="text-xs text-[#94A3B8] truncate">{cp.missionType} · {cp.type}</p>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveCheckpoint(cp.id, 'up') }}
                          disabled={idx === 0}
                          className="p-1 text-[#CBD5E1] hover:text-[#64748B] disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveCheckpoint(cp.id, 'down') }}
                          disabled={idx === checkpoints.length - 1}
                          className="p-1 text-[#CBD5E1] hover:text-[#64748B] disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteCheckpoint(cp.id) }}
                          className="p-1 text-[#CBD5E1] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded edit form */}
                    {selectedId === cp.id && (
                      <div className="px-4 pb-4 space-y-4" onClick={e => e.stopPropagation()}>

                        {/* Naam & Type */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Naam</label>
                            <input
                              type="text"
                              value={cp.name}
                              onChange={e => updateSelected({ name: e.target.value })}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Type</label>
                            <select value={cp.type} onChange={e => updateSelected({ type: e.target.value })} className={inputCls}>
                              {CHECKPOINT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>Beschrijving</label>
                          <textarea
                            value={cp.description ?? ''}
                            onChange={e => updateSelected({ description: e.target.value })}
                            rows={2}
                            className={inputCls + ' resize-none'}
                          />
                        </div>

                        {/* GPS */}
                        <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-[#00E676]" />
                            <span className="text-xs font-semibold text-[#0F172A]">Locatie</span>
                            <span className="text-xs text-[#94A3B8] ml-auto">Klik op de kaart om te plaatsen</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Breedtegraad</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={cp.latitude}
                                onChange={e => updateSelected({ latitude: parseFloat(e.target.value) || 0 })}
                                className={inputCls + ' text-xs font-mono'}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Lengtegraad</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={cp.longitude}
                                onChange={e => updateSelected({ longitude: parseFloat(e.target.value) || 0 })}
                                className={inputCls + ' text-xs font-mono'}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Unlock radius (meter)</label>
                            <input
                              type="number"
                              min={10}
                              max={500}
                              value={cp.unlockRadiusMeters}
                              onChange={e => updateSelected({ unlockRadiusMeters: Number(e.target.value) })}
                              className={inputCls}
                            />
                          </div>
                        </div>

                        {/* Navigatiehint */}
                        <div>
                          <label className={labelCls}>
                            <span className="flex items-center gap-1.5">
                              <Target className="w-3 h-3" />
                              Navigatiehint
                            </span>
                          </label>
                          <textarea
                            value={cp.navigationHint ?? ''}
                            onChange={e => updateSelected({ navigationHint: e.target.value })}
                            placeholder="Exacte aanwijzing hoe de locatie te vinden..."
                            rows={2}
                            className={inputCls + ' resize-none'}
                          />
                        </div>

                        {/* Missie */}
                        <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-1.5 mb-2">
                            <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
                            <span className="text-xs font-semibold text-[#0F172A]">Missie</span>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Type missie</label>
                            <select value={cp.missionType} onChange={e => updateSelected({ missionType: e.target.value })} className={inputCls}>
                              {MISSION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Missie titel</label>
                            <input
                              type="text"
                              value={cp.missionTitle}
                              onChange={e => updateSelected({ missionTitle: e.target.value })}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Missie beschrijving</label>
                            <textarea
                              value={cp.missionDescription}
                              onChange={e => updateSelected({ missionDescription: e.target.value })}
                              rows={3}
                              className={inputCls + ' resize-none'}
                            />
                          </div>
                          {cp.missionType === 'foto' && (
                            <div>
                              <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Bonus foto punten</label>
                              <input
                                type="number"
                                min={0}
                                value={cp.bonusPhotoPoints}
                                onChange={e => updateSelected({ bonusPhotoPoints: Number(e.target.value) })}
                                className={inputCls}
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock className="w-3 h-3 text-[#94A3B8]" />
                              <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Tijdslimiet (seconden, leeg = geen)</label>
                            </div>
                            <input
                              type="number"
                              min={60}
                              placeholder="bv. 480 = 8 min"
                              value={cp.timeLimitSeconds ?? ''}
                              onChange={e => updateSelected({ timeLimitSeconds: e.target.value ? Number(e.target.value) : null })}
                              className={inputCls}
                            />
                          </div>
                        </div>

                        {/* GMS scores */}
                        <div className="bg-[#F8FAFC] rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-3">
                            <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span className="text-xs font-semibold text-[#0F172A]">GMS dimensies (max 25 per dimensie)</span>
                            <span className="ml-auto text-xs font-bold text-[#0F172A]">
                              Totaal: {cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <GmsSlider label="Verbinding" value={cp.gmsConnection} onChange={v => updateSelected({ gmsConnection: v })} />
                            <GmsSlider label="Betekenis" value={cp.gmsMeaning} onChange={v => updateSelected({ gmsMeaning: v })} />
                            <GmsSlider label="Vreugde" value={cp.gmsJoy} onChange={v => updateSelected({ gmsJoy: v })} />
                            <GmsSlider label="Groei" value={cp.gmsGrowth} onChange={v => updateSelected({ gmsGrowth: v })} />
                          </div>
                        </div>

                        {/* Hints */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span className="text-xs font-semibold text-[#0F172A]">Hints (3 niveaus)</span>
                          </div>
                          <div className="space-y-2">
                            {(['hint1', 'hint2', 'hint3'] as const).map((k, i) => (
                              <input
                                key={k}
                                type="text"
                                placeholder={`Hint ${i + 1} (${['makkelijkst', 'gemiddeld', 'moeilijkst'][i]})`}
                                value={cp[k] ?? ''}
                                onChange={e => updateSelected({ [k]: e.target.value })}
                                className={inputCls}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Kids safe */}
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cp.isKidsFriendly}
                            onChange={e => updateSelected({ isKidsFriendly: e.target.checked })}
                            className="w-4 h-4 rounded accent-[#00E676]"
                          />
                          <span className="text-sm text-[#0F172A]">Geschikt voor kids (JeugdTocht)</span>
                        </label>

                        {/* Save button */}
                        <button
                          onClick={() => saveCheckpoint(cp)}
                          disabled={savingCp}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-semibold hover:bg-[#1E293B] disabled:opacity-60 transition-colors"
                        >
                          {savingCp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Checkpoint opslaan
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add checkpoint button */}
              <div className="p-4 border-t border-[#E2E8F0]">
                <button
                  onClick={addCheckpoint}
                  disabled={addingCp}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#00E676] text-[#16A34A] rounded-xl text-sm font-semibold hover:bg-[#F0FDF4] disabled:opacity-60 transition-colors"
                >
                  {addingCp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Nieuw checkpoint
                </button>
              </div>
            </div>
          )}

          {/* ── Tour info tab ── */}
          {tab === 'info' && (
            <div className="p-5 space-y-5">
              <div>
                <label className={labelCls}>Naam</label>
                <input
                  type="text"
                  value={tourData.name}
                  onChange={e => setTourData(d => ({ ...d, name: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Beschrijving</label>
                <textarea
                  value={tourData.description ?? ''}
                  onChange={e => setTourData(d => ({ ...d, description: e.target.value }))}
                  rows={3}
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Variant</label>
                  <select
                    value={tourData.variant}
                    onChange={e => setTourData(d => ({ ...d, variant: e.target.value }))}
                    className={inputCls}
                  >
                    {VARIANT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Max teams</label>
                  <input
                    type="number"
                    min={1}
                    value={tourData.maxTeams ?? ''}
                    onChange={e => setTourData(d => ({ ...d, maxTeams: Number(e.target.value) || null }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Geschatte duur (minuten)</label>
                <input
                  type="number"
                  min={15}
                  value={tourData.estimatedDurationMin ?? ''}
                  onChange={e => setTourData(d => ({ ...d, estimatedDurationMin: Number(e.target.value) || null }))}
                  className={inputCls}
                />
              </div>

              {/* Pricing */}
              <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-3">
                <p className="text-xs font-semibold text-[#0F172A]">Prijs (Stripe)</p>
                <div>
                  <label className={labelCls}>Prijsmodel</label>
                  <select
                    value={tourData.pricingModel}
                    onChange={e => setTourData(d => ({ ...d, pricingModel: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="flat">Vast bedrag</option>
                    <option value="per_person">Per persoon</option>
                  </select>
                </div>
                {tourData.pricingModel === 'flat' ? (
                  <div>
                    <label className={labelCls}>Prijs (eurocent, 0 = gratis)</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={tourData.priceInCents}
                      onChange={e => setTourData(d => ({ ...d, priceInCents: Number(e.target.value) || 0 }))}
                      className={inputCls}
                    />
                    <p className="text-xs text-[#94A3B8] mt-1">€{(tourData.priceInCents / 100).toFixed(2)}</p>
                  </div>
                ) : (
                  <div>
                    <label className={labelCls}>Prijs per persoon (eurocent)</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={tourData.pricePerPersonCents}
                      onChange={e => setTourData(d => ({ ...d, pricePerPersonCents: Number(e.target.value) || 0 }))}
                      className={inputCls}
                    />
                    <p className="text-xs text-[#94A3B8] mt-1">€{(tourData.pricePerPersonCents / 100).toFixed(2)} per persoon</p>
                  </div>
                )}
              </div>

              {/* Story frame */}
              <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-3">
                <p className="text-xs font-semibold text-[#0F172A]">Verhaalframe (optioneel)</p>
                <div>
                  <label className={labelCls}>Intro tekst</label>
                  <textarea
                    value={tourData.storyFrame?.introText ?? ''}
                    onChange={e => setTourData(d => ({ ...d, storyFrame: { ...(d.storyFrame ?? {}), introText: e.target.value } }))}
                    rows={3}
                    placeholder="Intro tekst die teams zien bij aanvang..."
                    className={inputCls + ' resize-none'}
                  />
                </div>
                <div>
                  <label className={labelCls}>Finale onthulling</label>
                  <textarea
                    value={tourData.storyFrame?.finaleReveal ?? ''}
                    onChange={e => setTourData(d => ({ ...d, storyFrame: { ...(d.storyFrame ?? {}), finaleReveal: e.target.value } }))}
                    rows={3}
                    placeholder="Tekst/onthulling bij het voltooien..."
                    className={inputCls + ' resize-none'}
                  />
                </div>
              </div>

              <button
                onClick={saveTourInfo}
                disabled={savingTour}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-semibold hover:bg-[#1E293B] disabled:opacity-60 transition-colors"
              >
                {savingTour ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Tocht-info opslaan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right panel: map */}
      <div className="flex-1 relative">
        {selectedId && (
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-sm">
            <p className="text-xs font-semibold text-[#0F172A]">
              <MapPin className="w-3 h-3 inline mr-1 text-[#00E676]" />
              Klik op de kaart om locatie van checkpoint {checkpoints.findIndex(c => c.id === selectedId) + 1} te zetten
            </p>
          </div>
        )}
        <CheckpointMap
          checkpoints={mapCheckpoints}
          selectedId={selectedId}
          onMapClick={handleMapClick}
          onMarkerClick={setSelectedId}
          onMarkerDrag={handleMarkerDrag}
        />
      </div>
    </div>
  )
}
