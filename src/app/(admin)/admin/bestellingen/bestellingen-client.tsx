'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminStatusBadge } from '@/components/admin/admin-status-badge'
import { AdminActionButton } from '@/components/admin/admin-action-button'
import { AdminTableSkeleton, AdminErrorState } from '@/components/admin/admin-skeleton'
import { VARIANT_OPTIONS, formatEuro } from '@/lib/admin-constants'
import { toast } from 'sonner'
import { Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

type Order = {
  id: string
  customerName: string | null
  customerEmail: string
  tourName: string | null
  tourVariant: string | null
  amountCents: number | null
  originalAmountCents: number | null
  couponCode: string | null
  status: string
  source: string | null
  paidAt: string | null
  participantCount: number | null
  organizationName: string | null
  createdAt: string
}

type Props = {
  tourOptions: { id: string; name: string }[]
}

const PAGE_SIZE = 50

const DATE_PRESETS = [
  { value: '', label: 'Alle perioden' },
  { value: 'today', label: 'Vandaag' },
  { value: 'week', label: 'Deze week' },
  { value: 'month', label: 'Deze maand' },
]

function dateRange(preset: string): { from: string; to: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = fmt(now)

  if (preset === 'today') return { from: today, to: today }
  if (preset === 'week') {
    const mon = new Date(now)
    mon.setDate(now.getDate() - now.getDay() + 1)
    return { from: fmt(mon), to: today }
  }
  if (preset === 'month') {
    return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: today }
  }
  return { from: '', to: '' }
}

export function BestellingenClient({ tourOptions }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedTour, setSelectedTour] = useState('')
  const [datePreset, setDatePreset] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (selectedStatus) params.set('status', selectedStatus)
      if (selectedTour) params.set('tourId', selectedTour)
      const { from, to } = dateRange(datePreset)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/admin/bestellingen?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setOrders(data.orders)
      setTotalRevenue(data.totalRevenue)
      setPage(1)
    } catch {
      setError('Bestellingen konden niet worden geladen')
    } finally {
      setLoading(false)
    }
  }, [selectedStatus, selectedTour, datePreset])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE))
  const pageOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const inputCls = "h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-white rounded-xl border border-[#E2E8F0]">
        <div>
          <div className="text-xs text-[#94A3B8] uppercase tracking-wide mb-0.5">Totale omzet (betaald)</div>
          <div className="text-2xl font-bold text-[#0F172A]">{formatEuro(totalRevenue)}</div>
        </div>
        <div className="h-10 w-px bg-[#F1F5F9]" />
        <div>
          <div className="text-xs text-[#94A3B8] uppercase tracking-wide mb-0.5">Gefilterde bestellingen</div>
          <div className="text-2xl font-bold text-[#0F172A]">{orders.length}</div>
        </div>
        <div className="flex-1" />
        <a
          href="/api/admin/bestellingen/export"
          download
          className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E293B] transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV Export
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className={inputCls}>
          <option value="">Status: Alles</option>
          <option value="paid">Betaald</option>
          <option value="free">Gratis</option>
          <option value="pending">In behandeling</option>
          <option value="refunded">Terugbetaald</option>
        </select>
        <select value={selectedTour} onChange={e => setSelectedTour(e.target.value)} className={inputCls}>
          <option value="">Tocht: Alles</option>
          {tourOptions.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select value={datePreset} onChange={e => setDatePreset(e.target.value)} className={inputCls}>
          {DATE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button
          onClick={load}
          className="h-9 w-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors"
          title="Vernieuwen"
        >
          <RefreshCw className={`w-4 h-4 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <AdminTableSkeleton rows={8} cols={7} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    {['Klant', 'Tocht', 'Bedrag', 'Korting', 'Status', 'Betaald op', 'Acties'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {pageOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <p className="text-[#94A3B8] text-sm font-medium">Geen bestellingen gevonden</p>
                        <p className="text-[#CBD5E1] text-xs mt-1">Pas de filters aan om meer te zien</p>
                      </td>
                    </tr>
                  ) : pageOrders.map(order => (
                    <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A] text-xs">{order.customerName ?? '—'}</div>
                        <div className="text-[#94A3B8] text-xs">{order.customerEmail}</div>
                        {order.organizationName && <div className="text-[#64748B] text-xs">{order.organizationName}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-[#0F172A]">{order.tourName ?? '—'}</div>
                        {order.tourVariant && (
                          <span className="text-xs text-[#94A3B8]">
                            {VARIANT_OPTIONS.find(v => v.value === order.tourVariant)?.label ?? order.tourVariant}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#0F172A] text-sm">{formatEuro(order.amountCents ?? 0)}</div>
                        {order.originalAmountCents && order.originalAmountCents !== order.amountCents && (
                          <div className="text-xs text-[#94A3B8] line-through">{formatEuro(order.originalAmountCents)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {order.couponCode ? (
                          <code className="text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded font-mono">{order.couponCode}</code>
                        ) : <span className="text-[#94A3B8]">—</span>}
                      </td>
                      <td className="px-4 py-3"><AdminStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {order.paidAt ? new Date(order.paidAt).toLocaleDateString('nl-NL') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {order.status !== 'refunded' && order.status !== 'pending' && (
                          <AdminActionButton
                            label="Terugbetalen"
                            apiUrl={`/api/admin/bestellingen/${order.id}`}
                            method="PATCH"
                            body={{ action: 'refund' }}
                            variant="danger"
                            confirmMessage={`Bestelling van ${order.customerEmail} terugbetalen?`}
                            onSuccess={() => {
                              toast.success('Bestelling gemarkeerd als terugbetaald')
                              load()
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#94A3B8]">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.length)} van {orders.length}
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
