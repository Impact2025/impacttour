'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AdminActionButton } from '@/components/admin/admin-action-button'
import { AdminTableSkeleton, AdminErrorState } from '@/components/admin/admin-skeleton'
import { VARIANT_OPTIONS, variantColor, variantLabel, formatEuro } from '@/lib/admin-constants'
import { toast } from 'sonner'
import { RefreshCw, ExternalLink, Loader2, ImagePlus, X, Search, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
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

const PAGE_SIZE = 50

function ImageCell({ tocht, onUpdated }: { tocht: Tocht; onUpdated: (id: string, url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const imageUrl = (tocht.aiConfig?.imageUrl as string) || null

  const handleFile = async (file: File) => {
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(`/api/admin/tochten/${tocht.id}/image`, { method: 'POST', body: form })
    setUploading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error((data.error as string) ?? 'Upload mislukt')
      return
    }
    const data = await res.json()
    onUpdated(tocht.id, data.url as string)
    toast.success('Foto geüpload')
  }

  const handleDelete = async () => {
    setUploading(true)
    await fetch(`/api/admin/tochten/${tocht.id}/image`, { method: 'DELETE' })
    setUploading(false)
    onUpdated(tocht.id, null)
    toast.success('Foto verwijderd')
  }

  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        {imageUrl && (
          <div className="relative group/img shrink-0">
            <Image src={imageUrl} alt={tocht.name} width={48} height={36} className="rounded-lg object-cover border border-[#E2E8F0]" />
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EF4444] text-white rounded-full hidden group-hover/img:flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-[#CBD5E1] text-[#64748B] rounded-lg text-xs font-medium hover:border-[#00E676] hover:text-[#00C853] transition-colors"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
          {imageUrl ? 'Vervang' : 'Foto'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
      </div>
    </td>
  )
}

export function TochtenClient() {
  const [tochten, setTochten] = useState<Tocht[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [variantFilter, setVariantFilter] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (variantFilter) params.set('variant', variantFilter)
      if (publishedFilter) params.set('published', publishedFilter)
      const res = await fetch(`/api/admin/tochten?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTochten(await res.json())
      setPage(1)
    } catch {
      setError('Tochten konden niet worden geladen')
    } finally {
      setLoading(false)
    }
  }, [variantFilter, publishedFilter])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? tochten.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.variant.includes(search.toLowerCase()) ||
        t.creatorEmail?.toLowerCase().includes(search.toLowerCase())
      )
    : tochten

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageTochten = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
      toast.success(data.isPublished ? 'Tocht gepubliceerd' : 'Tocht op concept gezet')
    } else {
      toast.error('Publicatie wijzigen mislukt')
    }
    setToggling(null)
  }

  const handleImageUpdated = (id: string, url: string | null) => {
    setTochten(prev => prev.map(t =>
      t.id === id ? { ...t, aiConfig: { ...(t.aiConfig ?? {}), imageUrl: url ?? undefined } } : t
    ))
  }

  const priceLabel = (t: Tocht) => {
    if (t.pricingModel === 'per_person' && t.pricePerPersonCents && t.pricePerPersonCents > 0)
      return `${formatEuro(t.pricePerPersonCents)} p.p.`
    if (t.priceInCents && t.priceInCents > 0)
      return `${formatEuro(t.priceInCents)} vast`
    return 'Gratis'
  }

  const inputCls = "h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Zoek tocht..."
            className="h-9 pl-8 pr-8 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 w-52"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <select value={variantFilter} onChange={e => setVariantFilter(e.target.value)} className={inputCls}>
          <option value="">Variant: Alles</option>
          {VARIANT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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

      {loading ? (
        <AdminTableSkeleton rows={6} cols={7} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
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
                  {pageTochten.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <p className="text-[#94A3B8] text-sm font-medium">Geen tochten gevonden</p>
                      </td>
                    </tr>
                  ) : pageTochten.map(t => (
                    <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A] text-sm">{t.name}</div>
                        <div className="text-[#94A3B8] text-xs">{new Date(t.createdAt).toLocaleDateString('nl-NL')}</div>
                        {t.creatorEmail && <div className="text-[#94A3B8] text-xs truncate max-w-[140px]">{t.creatorEmail}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: variantColor(t.variant) }}
                        >
                          {variantLabel(t.variant)}
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/tochten/${t.id}/edit`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#F0FDF4] text-[#16A34A] rounded-lg text-xs font-semibold hover:bg-[#DCFCE7] transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            Bewerk
                          </Link>
                          <Link
                            href={`/spelleider/tochten/${t.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#F1F5F9] text-[#64748B] rounded-lg text-xs font-semibold hover:bg-[#E2E8F0] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <AdminActionButton
                            label="Verwijder"
                            apiUrl={`/api/admin/tochten/${t.id}`}
                            method="PATCH"
                            body={{ action: 'delete' }}
                            variant="danger"
                            confirmMessage={`Tocht "${t.name}" verwijderen? Dit kan niet ongedaan worden gemaakt.`}
                            onSuccess={() => {
                              toast.success(`"${t.name}" verwijderd`)
                              load()
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#94A3B8]">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} van {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-[#0F172A]">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
