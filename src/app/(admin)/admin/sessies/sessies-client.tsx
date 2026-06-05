'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminStatusBadge } from '@/components/admin/admin-status-badge'
import { AdminTableSkeleton, AdminErrorState } from '@/components/admin/admin-skeleton'
import { VARIANT_OPTIONS, variantColor, variantLabel } from '@/lib/admin-constants'
import { ExternalLink, RefreshCw, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Sessie = {
  id: string
  name: string
  tourName: string | null
  variant: string
  status: string
  source: string | null
  joinCode: string
  spelleiderEmail: string | null
  teamCount: number
  avgGms: number | null
  scheduledAt: string | null
  startedAt: string | null
  createdAt: string
}

const PAGE_SIZE = 50

const STATUS_TABS = [
  { key: '', label: 'Alles' },
  { key: 'active', label: 'Actief' },
  { key: 'lobby', label: 'Lobby' },
  { key: 'completed', label: 'Voltooid' },
  { key: 'cancelled', label: 'Geannuleerd' },
]

export function SessiesClient() {
  const [sessies, setSessies] = useState<Sessie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [variantFilter, setVariantFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (variantFilter) params.set('variant', variantFilter)
      const res = await fetch(`/api/admin/sessies?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSessies(await res.json())
      setPage(1)
    } catch {
      setError('Sessies konden niet worden geladen')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, variantFilter])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? sessies.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.joinCode.includes(search) ||
        s.spelleiderEmail?.toLowerCase().includes(search.toLowerCase()) ||
        s.tourName?.toLowerCase().includes(search.toLowerCase())
      )
    : sessies

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSessies = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const inputCls = "h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"
  const isLive = (s: Sessie) => s.status === 'active' || s.status === 'lobby'

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-[#F1F5F9] rounded-xl p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === tab.key ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Zoek sessie, code, spelleider..."
            className="h-9 pl-8 pr-8 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 w-64"
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
        <button
          onClick={load}
          className="h-9 w-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors"
          title="Vernieuwen"
        >
          <RefreshCw className={`w-4 h-4 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
        </button>
        {statusFilter === 'active' || statusFilter === 'lobby' ? (
          <span className="flex items-center text-xs text-[#94A3B8] gap-1.5 ml-1">
            <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full animate-pulse" />
            Live data
          </span>
        ) : null}
      </div>

      {loading ? (
        <AdminTableSkeleton rows={8} cols={9} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    {['Sessie', 'Tocht', 'Variant', 'Status', 'Teams', 'Gem. GMS', 'Gepland', 'Bron', 'Acties'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {pageSessies.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <p className="text-[#94A3B8] text-sm font-medium">Geen sessies gevonden</p>
                        <p className="text-[#CBD5E1] text-xs mt-1">Pas de filters aan om meer te zien</p>
                      </td>
                    </tr>
                  ) : pageSessies.map(s => (
                    <tr key={s.id} className={`hover:bg-[#F8FAFC] transition-colors ${isLive(s) ? 'border-l-4 border-l-[#00E676]' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A] text-xs">{s.name}</div>
                        <div className="text-[#94A3B8] text-xs font-mono">{s.joinCode}</div>
                        {s.spelleiderEmail && <div className="text-[#94A3B8] text-xs truncate max-w-[140px]">{s.spelleiderEmail}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#0F172A]">{s.tourName ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: variantColor(s.variant) }}
                        >
                          {variantLabel(s.variant)}
                        </span>
                      </td>
                      <td className="px-4 py-3"><AdminStatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{s.teamCount}</td>
                      <td className="px-4 py-3">
                        {s.avgGms != null ? (
                          <span className={`text-sm font-semibold ${s.avgGms >= 70 ? 'text-[#00E676]' : 'text-[#0F172A]'}`}>
                            {s.avgGms}
                          </span>
                        ) : <span className="text-[#94A3B8]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('nl-NL') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{s.source ?? 'direct'}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/spelleider/sessies/${s.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#F1F5F9] text-[#64748B] rounded-lg text-xs font-semibold hover:bg-[#E2E8F0] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Bekijk
                        </Link>
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
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-[#0F172A]">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                >
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
