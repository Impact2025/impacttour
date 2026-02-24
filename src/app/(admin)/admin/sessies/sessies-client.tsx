'use client'

import { useState, useEffect } from 'react'
import { AdminStatusBadge } from '@/components/admin/admin-status-badge'
import { ExternalLink, RefreshCw } from 'lucide-react'
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

const VARIANT_COLORS: Record<string, string> = {
  wijktocht: '#00E676',
  impactsprint: '#3B82F6',
  familietocht: '#F59E0B',
  jeugdtocht: '#8B5CF6',
  voetbalmissie: '#EF4444',
}

export function SessiesClient() {
  const [sessies, setSessies] = useState<Sessie[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [variantFilter, setVariantFilter] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (variantFilter) params.set('variant', variantFilter)
    const res = await fetch(`/api/admin/sessies?${params.toString()}`)
    if (res.ok) setSessies(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter, variantFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const inputCls = "h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"
  const isLive = (s: Sessie) => s.status === 'active' || s.status === 'lobby'

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-[#F1F5F9] rounded-xl p-1 w-fit">
        {[
          { key: '', label: 'Alles' },
          { key: 'active', label: 'Actief' },
          { key: 'lobby', label: 'Lobby' },
          { key: 'completed', label: 'Voltooid' },
          { key: 'cancelled', label: 'Geannuleerd' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === tab.key ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={variantFilter} onChange={e => setVariantFilter(e.target.value)} className={inputCls}>
          <option value="">Variant: Alles</option>
          <option value="wijktocht">WijkTocht</option>
          <option value="impactsprint">ImpactSprint</option>
          <option value="familietocht">FamilieTocht</option>
          <option value="jeugdtocht">JeugdTocht</option>
          <option value="voetbalmissie">VoetbalMissie</option>
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
                  {['Sessie', 'Tocht', 'Variant', 'Status', 'Teams', 'Gem. GMS', 'Gepland', 'Bron', 'Acties'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {sessies.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-[#94A3B8]">Geen sessies gevonden</td></tr>
                ) : sessies.map(s => (
                  <tr key={s.id} className={`hover:bg-[#F8FAFC] transition-colors ${isLive(s) ? 'border-l-4 border-[#00E676]' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0F172A] text-xs">{s.name}</div>
                      <div className="text-[#94A3B8] text-xs font-mono">{s.joinCode}</div>
                      {s.spelleiderEmail && <div className="text-[#94A3B8] text-xs">{s.spelleiderEmail}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#0F172A]">{s.tourName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: VARIANT_COLORS[s.variant] ?? '#94A3B8' }}>
                        {s.variant}
                      </span>
                    </td>
                    <td className="px-4 py-3"><AdminStatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{s.teamCount}</td>
                    <td className="px-4 py-3">
                      {s.avgGms ? (
                        <span className={`text-sm font-semibold ${s.avgGms >= 70 ? 'text-[#00E676]' : 'text-[#0F172A]'}`}>{s.avgGms}</span>
                      ) : <span className="text-[#94A3B8]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">
                      {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('nl-NL') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">{s.source ?? 'direct'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/spelleider/sessies/${s.id}`} className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#F1F5F9] text-[#64748B] rounded-lg text-xs font-semibold hover:bg-[#E2E8F0] transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Bekijk
                      </Link>
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
