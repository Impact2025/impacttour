'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

// Leaflet mag alleen client-side geladen worden (geen SSR)
const CheckpointMap = dynamic(() => import('./checkpoint-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-2" />
        <p>Kaart laden...</p>
      </div>
    </div>
  ),
})

export interface CheckpointData {
  id: string
  orderIndex: number
  name: string
  type: string
  latitude: number
  longitude: number
  unlockRadiusMeters: number
  missionTitle: string
  missionDescription: string
  missionType: string
  gmsConnection: number
  gmsMeaning: number
  gmsJoy: number
  gmsGrowth: number
  hint1: string | null
  hint2: string | null
  hint3: string | null
  isKidsFriendly: boolean
  timeLimitSeconds: number | null
  bonusPhotoPoints: number
}

const CHECKPOINT_TYPES = [
  { value: 'kennismaking', label: 'Kennismaking' },
  { value: 'samenwerking', label: 'Samenwerking' },
  { value: 'reflectie', label: 'Reflectie' },
  { value: 'actie', label: 'Actie' },
  { value: 'feest', label: 'Feest' },
]

const MISSION_TYPES = [
  { value: 'opdracht', label: 'Opdracht' },
  { value: 'foto', label: 'Foto' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'video', label: 'Video' },
]

export function CheckpointEditor({
  tourId,
  initialCheckpoints,
  variant,
}: {
  tourId: string
  initialCheckpoints: CheckpointData[]
  variant: string
}) {
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>(initialCheckpoints)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingHints, setIsGeneratingHints] = useState(false)

  const selected = checkpoints.find((c) => c.id === selectedId)

  /** Nieuw checkpoint aanmaken via API en lokaal toevoegen */
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      const orderIndex = checkpoints.length
      const defaultType =
        orderIndex === 0 ? 'kennismaking' : orderIndex === checkpoints.length ? 'feest' : 'samenwerking'

      const res = await fetch(`/api/tours/${tourId}/checkpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIndex,
          name: `Checkpoint ${orderIndex + 1}`,
          type: defaultType,
          latitude: lat,
          longitude: lng,
          unlockRadiusMeters: 50,
          missionTitle: 'Nieuwe opdracht',
          missionDescription: 'Beschrijf hier de opdracht voor dit team.',
          missionType: 'opdracht',
          gmsConnection: 6,
          gmsMeaning: 6,
          gmsJoy: 7,
          gmsGrowth: 6,
          isKidsFriendly: variant === 'jeugdtocht' || variant === 'voetbalmissie',
          timeLimitSeconds: null,
          bonusPhotoPoints: 0,
        }),
      })

      if (!res.ok) {
        toast.error('Checkpoint kon niet worden aangemaakt')
        return
      }

      const cp = await res.json()
      setCheckpoints((prev) => [...prev, cp])
      setSelectedId(cp.id)
      toast.success(`Checkpoint ${orderIndex + 1} toegevoegd`)
    },
    [checkpoints.length, tourId, variant]
  )

  /** Checkpoint positie updaten na drag */
  const handleMarkerDrag = useCallback(
    async (checkpointId: string, lat: number, lng: number) => {
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === checkpointId ? { ...c, latitude: lat, longitude: lng } : c))
      )
      await fetch(`/api/tours/${tourId}/checkpoints/${checkpointId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
    },
    [tourId]
  )

  /** Opslaan vanuit de zijbalk */
  const handleSave = async () => {
    if (!selected) return
    setIsSaving(true)

    const res = await fetch(`/api/tours/${tourId}/checkpoints/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: selected.name,
        type: selected.type,
        unlockRadiusMeters: selected.unlockRadiusMeters,
        missionTitle: selected.missionTitle,
        missionDescription: selected.missionDescription,
        missionType: selected.missionType,
        gmsConnection: selected.gmsConnection,
        gmsMeaning: selected.gmsMeaning,
        gmsJoy: selected.gmsJoy,
        gmsGrowth: selected.gmsGrowth,
        hint1: selected.hint1,
        hint2: selected.hint2,
        hint3: selected.hint3,
        isKidsFriendly: selected.isKidsFriendly,
        timeLimitSeconds: selected.timeLimitSeconds,
        bonusPhotoPoints: selected.bonusPhotoPoints,
      }),
    })

    if (res.ok) {
      toast.success('Checkpoint opgeslagen')
    } else {
      toast.error('Opslaan mislukt')
    }
    setIsSaving(false)
  }

  /** AI hints genereren */
  const handleGenerateHints = async () => {
    if (!selected) return
    setIsGeneratingHints(true)

    const res = await fetch('/api/ai/hints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missionTitle: selected.missionTitle,
        missionDescription: selected.missionDescription,
      }),
    })

    if (res.ok) {
      const { hint1, hint2, hint3 } = await res.json()
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, hint1, hint2, hint3 } : c))
      )
      toast.success('Hints gegenereerd door AI')
    } else {
      toast.error('Hints genereren mislukt')
    }
    setIsGeneratingHints(false)
  }

  /** Checkpoint verwijderen */
  const handleDelete = async (checkpointId: string) => {
    if (!confirm('Checkpoint verwijderen?')) return

    const res = await fetch(`/api/tours/${tourId}/checkpoints/${checkpointId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setCheckpoints((prev) => {
        const filtered = prev.filter((c) => c.id !== checkpointId)
        // Herbereken orderIndex
        return filtered.map((c, idx) => ({ ...c, orderIndex: idx }))
      })
      if (selectedId === checkpointId) setSelectedId(null)
      toast.success('Checkpoint verwijderd')
    }
  }

  const updateSelected = (updates: Partial<CheckpointData>) => {
    if (!selectedId) return
    setCheckpoints((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, ...updates } : c))
    )
  }

  return (
    <div className="flex h-full">
      {/* Kaart */}
      <div className="flex-1 relative">
        <CheckpointMap
          checkpoints={checkpoints}
          selectedId={selectedId}
          onMapClick={handleMapClick}
          onMarkerClick={setSelectedId}
          onMarkerDrag={handleMarkerDrag}
        />

        {/* Checkpoints lijst overlay links-onder */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-3 max-w-xs max-h-48 overflow-y-auto z-[1000]">
          <p className="text-xs font-medium text-gray-500 mb-2">
            {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}
            {checkpoints.length === 0 && ' — klik op de kaart om toe te voegen'}
          </p>
          {checkpoints.map((cp, idx) => (
            <button
              key={cp.id}
              onClick={() => setSelectedId(cp.id)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                selectedId === cp.id ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center shrink-0 font-bold">
                {idx + 1}
              </span>
              <span className="truncate">{cp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zijbalk: checkpoint bewerken */}
      {selected ? (
        <div className="w-80 bg-white border-l overflow-y-auto flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Checkpoint bewerken</h3>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Naam */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Naam</label>
              <input
                type="text"
                value={selected.name}
                onChange={(e) => updateSelected({ name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Type + MissionType */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select
                  value={selected.type}
                  onChange={(e) => updateSelected({ type: e.target.value })}
                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {CHECKPOINT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Missie type</label>
                <select
                  value={selected.missionType}
                  onChange={(e) => updateSelected({ missionType: e.target.value })}
                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {MISSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unlock radius */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Unlock radius: {selected.unlockRadiusMeters}m
              </label>
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={selected.unlockRadiusMeters}
                onChange={(e) => updateSelected({ unlockRadiusMeters: Number(e.target.value) })}
                className="w-full accent-green-600"
              />
            </div>

            {/* Missie titel */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Opdrachttitel</label>
              <input
                type="text"
                value={selected.missionTitle}
                onChange={(e) => updateSelected({ missionTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Missie beschrijving */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Opdrachtbeschrijving</label>
              <textarea
                value={selected.missionDescription}
                onChange={(e) => updateSelected({ missionDescription: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* GMS scores */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                GMS punten (max 25 per dimensie)
              </label>
              {([
                ['gmsConnection', 'Verbinding'],
                ['gmsMeaning', 'Betekenis'],
                ['gmsJoy', 'Plezier'],
                ['gmsGrowth', 'Groei'],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={selected[key]}
                    onChange={(e) => updateSelected({ [key]: Number(e.target.value) })}
                    className="flex-1 accent-green-600"
                  />
                  <span className="text-xs text-gray-700 w-6 text-right">{selected[key]}</span>
                </div>
              ))}
              <div className="text-xs text-gray-400 mt-1">
                Totaal: {selected.gmsConnection + selected.gmsMeaning + selected.gmsJoy + selected.gmsGrowth}/100
              </div>
            </div>

            {/* Hints */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-500">Hints (3 niveaus)</label>
                <button
                  onClick={handleGenerateHints}
                  disabled={isGeneratingHints}
                  className="text-xs text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  {isGeneratingHints ? '...' : 'AI hints'}
                </button>
              </div>
              {[
                ['hint1', 'Vage hint'],
                ['hint2', 'Middelhint'],
                ['hint3', 'Specifieke hint'],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  type="text"
                  value={(selected[key as keyof CheckpointData] as string) ?? ''}
                  onChange={(e) => updateSelected({ [key]: e.target.value || null })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 mb-1.5"
                />
              ))}
            </div>

            {/* Tijdslimiet + Bonus foto (voor VoetbalMissie / JeugdTocht) */}
            {(variant === 'voetbalmissie' || variant === 'jeugdtocht') && (
              <div className="space-y-3 border-t pt-3">
                <p className="text-xs font-medium text-gray-500">Kids opties</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Tijdslimiet (seconden, leeg = geen)
                  </label>
                  <input
                    type="number"
                    min={60}
                    max={3600}
                    step={60}
                    value={selected.timeLimitSeconds ?? ''}
                    onChange={(e) =>
                      updateSelected({
                        timeLimitSeconds: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="bijv. 480 = 8 min"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  {selected.timeLimitSeconds && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      = {Math.floor(selected.timeLimitSeconds / 60)} min {selected.timeLimitSeconds % 60 > 0 ? `${selected.timeLimitSeconds % 60}s` : ''}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Bonus punten bij teamfoto (0 = geen bonus)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    step={10}
                    value={selected.bonusPhotoPoints}
                    onChange={(e) => updateSelected({ bonusPhotoPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  {selected.bonusPhotoPoints > 0 && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      +{selected.bonusPhotoPoints} bonuspunten bij teamfoto
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer acties */}
          <div className="p-4 border-t flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Opslaan...' : 'Opslaan'}
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
            >
              Verwijder
            </button>
          </div>
        </div>
      ) : (
        <div className="w-64 bg-white border-l flex items-center justify-center p-6 text-center text-gray-400">
          <div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="text-sm">
              Klik op de kaart om een checkpoint toe te voegen, of selecteer een bestaand checkpoint.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
