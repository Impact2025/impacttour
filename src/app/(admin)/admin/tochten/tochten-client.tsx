'use client'

import { useState, useEffect, useRef } from 'react'
import { AdminActionButton } from '@/components/admin/admin-action-button'
import { RefreshCw, ExternalLink, Loader2, ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Tocht = {
  id: string
  name: string
  variant: string
  isPublished: boolean
  priceInCents: number | null
  pricingModel: string | null
  pricePerPersonCents?: number | null
  aiConfig?: Record<string, unknown> | null
  creatorEmail: string | null
  sessionCount: number
  createdAt: string
}

const VARIANT_COLORS: Record<string, string> = {
  wijktocht: '#00E676',
  impactsprint: '#3B82F6',
  familietocht: '#F59E0B',
  jeugdtocht: '#8B5CF6',
  voetbalmissie: '#EF4444',
}

function ImageCell({ tocht, onUpdated }: { tocht: Tocht; onUpdated: (id: string, url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const imageUrl = (tocht.aiConfig?.imageUrl as string) || null

  const handleFile = async (file: File) => {
    setError('')
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(`/api/admin/tochten/${tocht.id}/image`, { method: 'POST', body: form })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) { setError(data.error ?? 'Upload mislukt'); return }
    onUpdated(tocht.id, data.url)
  }

  const handleDelete = async () => {
    setUploading(true)
    await fetch(`/api/admin/tochten/${tocht.id}/image`, { method: 'DELETE' })
    setUploading(false)
    onUpdated(tocht.id, null)
  }

  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        {imageUrl ? (
          <div className="relative group/img shrink-0">
            <Image
              src={imageUrl}
              alt={tocht.name}
              width={48}
              height={36}
              className="rounded-lg object-cover border border-[#E2E8F0]"
            />
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EF4444] text-white rounded-full hidden group-hover/img:flex items-center justify-center"
              title="Foto verwijderen"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : null}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-[#CBD5E1] text-[#64748B] rounded-lg text-xs font-medium hover:border-[#00E676] hover:text-[#00C853] transition-colors"
          title={imageUrl ? 'Foto vervangen' : 'Foto toevoegen'}
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
          {imageUrl ? 'Vervangen' : 'Foto'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
      </div>
      {error && <p className="text-[10px] text-[#EF4444] mt-1">{error}</p>}
    </td>
  )
}

export function TochtenClient() {
  const [tochten, setTochten] = useState<Tocht[]>([])
  const [loading, setLoading] = useState(true)
  const [variantFilter, setVariantFilter] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (variantFilter) params.set('variant', variantFilter)
    if (publishedFilter) params.set('published', publishedFilter)
    const res = await fetch(`/api/admin/tochten?${params.toString()}`)
    if (res.ok) setTochten(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [variantFilter, publishedFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTogglePublish = async (id: string) => {
    setToggling(id)
    const res = await fetch(`/api/admin/tochten/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_publish' }),
    })
    if (res.ok) {
      const data = await res.json()
      setTochten(prev => prev.map(t => t.id === id ? { ...t, isPublished: data.isPublished } : t))
    }
    setToggling(null)
  }

  const handleImageUpdated = (id: string, url: string | null) => {
    setTochten(prev => prev.map(t =>
      t.id === id
        ? { ...t, aiConfig: { ...(t.aiConfig ?? {}), imageUrl: url ?? undefined } }
        : t
    ))
  }

  const priceLabel = (t: Tocht) => {
    if (t.pricingModel === 'per_person' && t.pricePerPersonCents && t.pricePerPersonCents > 0)
      return `€${(t.pricePerPersonCents / 100).toFixed(0)} p.p.`
    if (t.priceInCents && t.priceInCents > 0)
      return `€${(t.priceInCents / 100).toFixed(0)} vast`
    return 'Gratis'
  }

  const inputCls = "h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select value={variantFilter} onChange={e => setVariantFilter(e.target.value)} className={inputCls}>
          <option value="">Variant: Alles</option>
          <option value="wijktocht">WijkTocht</option>
          <option value="impactsprint">ImpactSprint</option>
          <option value="familietocht">FamilieTocht</option>
          <option value="jeugdtocht">JeugdTocht</option>
          <option value="voetbalmissie">VoetbalMissie</option>
        </select>
        <select value={publishedFilter} onChange={e => setPublishedFilter(e.target.value)} className={inputCls}>
          <option value="">Publicatie: Alles</option>
          <option value="true">Gepubliceerd</option>
          <option value="false">Concept</option>
        </select>
        <button onClick={load} className="h-9 w-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors">
          <RefreshCw className={`w-4 h-4 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#94A3B8]">Laden...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {['Naam', 'Variant', 'Foto', 'Prijs', 'Sessies', 'Gepubliceerd', 'Acties'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {tochten.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-[#94A3B8]">Geen tochten gevonden</td></tr>
                ) : tochten.map(t => (
                  <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0F172A] text-sm">{t.name}</div>
                      <div className="text-[#94A3B8] text-xs">{new Date(t.createdAt).toLocaleDateString('nl-NL')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: VARIANT_COLORS[t.variant] ?? '#94A3B8' }}>
                        {t.variant}
                      </span>
                    </td>

                    <ImageCell tocht={t} onUpdated={handleImageUpdated} />

                    <td className="px-4 py-3 text-xs text-[#0F172A]">{priceLabel(t)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{t.sessionCount}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublish(t.id)}
                        disabled={toggling === t.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${t.isPublished ? 'bg-[#00E676]' : 'bg-[#E2E8F0]'}`}
                      >
                        {toggling === t.id ? (
                          <Loader2 className="w-3 h-3 animate-spin mx-auto text-[#0F172A]" />
                        ) : (
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${t.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Link href={`/spelleider/tochten/${t.id}`} className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#F1F5F9] text-[#64748B] rounded-lg text-xs font-semibold hover:bg-[#E2E8F0] transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Bekijk
                      </Link>
                      <AdminActionButton
                        label="Verwijder"
                        apiUrl={`/api/admin/tochten/${t.id}`}
                        method="PATCH"
                        body={{ action: 'delete' }}
                        variant="danger"
                        confirmMessage={`Tocht "${t.name}" verwijderen? Dit kan niet ongedaan worden gemaakt.`}
                        onSuccess={load}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
