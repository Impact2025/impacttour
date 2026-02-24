'use client'

import { useState, useEffect, useRef } from 'react'
import { AdminStatusBadge } from '@/components/admin/admin-status-badge'
import { RefreshCw, ChevronDown, ChevronUp, RotateCcw, Loader2 } from 'lucide-react'

type WebhookEvent = {
  id: string
  provider: string
  eventId: string
  rawPayload: unknown
  status: string
  errorMessage: string | null
  processedAt: string | null
  createdAt: string
}

export function WebhooksClient() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [retrying, setRetrying] = useState<string | null>(null)
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = async (status = statusFilter) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/webhooks?${params.toString()}`)
    if (res.ok) setEvents(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh when pending filter is active
  useEffect(() => {
    if (statusFilter === 'pending') {
      autoRefreshRef.current = setInterval(() => load('pending'), 30000)
    } else {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
    }
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current) }
  }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = async (id: string) => {
    setRetrying(id)
    const res = await fetch(`/api/admin/webhooks/${id}/retry`, { method: 'POST' })
    if (res.ok) await load()
    setRetrying(null)
  }

  const inputCls = "h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls}>
          <option value="">Status: Alles</option>
          <option value="pending">In behandeling</option>
          <option value="processed">Verwerkt</option>
          <option value="failed">Mislukt</option>
          <option value="duplicate">Duplicaat</option>
        </select>
        <button onClick={() => load()} className="h-9 w-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors">
          <RefreshCw className={`w-4 h-4 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
        </button>
        {statusFilter === 'pending' && (
          <span className="flex items-center text-xs text-[#94A3B8] gap-1">
            <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full animate-pulse" />
            Auto-refresh 30s
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#94A3B8]">Laden...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-[#94A3B8]">Geen webhook events gevonden</div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {events.map(event => (
              <div key={event.id}>
                <div className="px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-5 gap-3 items-center text-sm">
                      <span className="font-mono text-xs bg-[#F1F5F9] px-2 py-0.5 rounded text-[#64748B]">{event.provider}</span>
                      <span className="text-xs text-[#0F172A] font-mono truncate">{event.eventId}</span>
                      <AdminStatusBadge status={event.status} />
                      <span className="text-xs text-[#94A3B8]">{new Date(event.createdAt).toLocaleString('nl-NL')}</span>
                      <span className="text-xs text-[#94A3B8]">{event.processedAt ? new Date(event.processedAt).toLocaleString('nl-NL') : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(event.id)}
                          disabled={retrying === event.id}
                          className="flex items-center gap-1 px-2 py-1.5 bg-[#FEE2E2] text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {retrying === event.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          Herverwerk
                        </button>
                      )}
                      <button
                        onClick={() => setExpanded(expanded === event.id ? null : event.id)}
                        className="p-1.5 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                      >
                        {expanded === event.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {event.errorMessage && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">{event.errorMessage}</div>
                  )}
                </div>
                {expanded === event.id && (
                  <div className="px-4 pb-4">
                    <pre className="bg-[#0F172A] text-[#E2E8F0] text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">
                      {JSON.stringify(event.rawPayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
