'use client'

import { useState, useEffect } from 'react'
import { AdminStatusBadge } from '@/components/admin/admin-status-badge'
import { AdminActionButton } from '@/components/admin/admin-action-button'
import { Download, RefreshCw } from 'lucide-react'

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

export function BestellingenClient({ tourOptions }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedTour, setSelectedTour] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedStatus) params.set('status', selectedStatus)
    if (selectedTour) params.set('tourId', selectedTour)
    const res = await fetch(`/api/admin/bestellingen?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders)
      setTotalRevenue(data.totalRevenue)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedStatus, selectedTour]) // eslint-disable-line react-hooks/exhaustive-deps

  const inputCls = "h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-[#E2E8F0]">
        <div>
          <div className="text-xs text-[#94A3B8] uppercase tracking-wide">Totale Omzet</div>
          <div className="text-2xl font-bold text-[#0F172A]">€{(totalRevenue / 100).toFixed(2)}</div>
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
        <button onClick={load} className="h-9 w-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors">
          <RefreshCw className={`w-4 h-4 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#94A3B8]">Laden...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {['Klant', 'Tocht', 'Bedrag', 'Korting', 'Status', 'Bron', 'Betaald op', 'Acties'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-[#94A3B8]">Geen bestellingen gevonden</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0F172A] text-xs">{order.customerName ?? '—'}</div>
                      <div className="text-[#94A3B8] text-xs">{order.customerEmail}</div>
                      {order.organizationName && <div className="text-[#64748B] text-xs">{order.organizationName}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-[#0F172A]">{order.tourName ?? '—'}</div>
                      {order.tourVariant && <span className="text-xs text-[#94A3B8]">{order.tourVariant}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#0F172A] text-sm">€{((order.amountCents ?? 0) / 100).toFixed(2)}</div>
                      {order.originalAmountCents && order.originalAmountCents !== order.amountCents && (
                        <div className="text-xs text-[#94A3B8] line-through">€{(order.originalAmountCents / 100).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.couponCode ? (
                        <code className="text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded font-mono">{order.couponCode}</code>
                      ) : <span className="text-[#94A3B8]">—</span>}
                    </td>
                    <td className="px-4 py-3"><AdminStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">{order.source ?? 'direct'}</td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">{order.paidAt ? new Date(order.paidAt).toLocaleDateString('nl-NL') : '—'}</td>
                    <td className="px-4 py-3">
                      {order.status !== 'refunded' && order.status !== 'pending' && (
                        <AdminActionButton
                          label="Terugbetalen"
                          apiUrl={`/api/admin/bestellingen/${order.id}`}
                          method="PATCH"
                          body={{ action: 'refund' }}
                          variant="danger"
                          confirmMessage={`Weet je zeker dat je bestelling van ${order.customerEmail} wilt terugbetalen?`}
                          onSuccess={load}
                        />
                      )}
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
