'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminActionButton } from '@/components/admin/admin-action-button'
import { AdminTableSkeleton, AdminErrorState } from '@/components/admin/admin-skeleton'
import { toast } from 'sonner'
import { Search, X, Mail, Shield, UserX, ChevronLeft, ChevronRight } from 'lucide-react'

type Gebruiker = {
  id: string
  name: string | null
  email: string
  role: string
  organizationName: string | null
  phone: string | null
  tourCount: number
  sessionCount: number
  createdAt: string
}

const PAGE_SIZE = 50

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-[#DCFCE7] text-[#166534]',
  spelleider: 'bg-[#DBEAFE] text-[#1D4ED8]',
  deactivated: 'bg-[#F1F5F9] text-[#94A3B8]',
}

export function GebruikersClient() {
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async (q = '') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      const res = await fetch(`/api/admin/gebruikers?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setGebruikers(await res.json())
      setPage(1)
    } catch {
      setError('Gebruikers konden niet worden geladen')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const timer = setTimeout(() => load(search), 350)
    return () => clearTimeout(timer)
  }, [search, load])

  const totalPages = Math.max(1, Math.ceil(gebruikers.length / PAGE_SIZE))
  const pageUsers = gebruikers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4 w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Zoek op email, naam, organisatie..."
          className="w-full h-10 pl-9 pr-9 border border-[#E2E8F0] rounded-xl text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <AdminTableSkeleton rows={8} cols={7} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={() => load(search)} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    {['Gebruiker', 'Organisatie', 'Rol', 'Tochten', 'Sessies', 'Aangemeld', 'Acties'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {pageUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <p className="text-[#94A3B8] text-sm font-medium">Geen gebruikers gevonden</p>
                        {search && <p className="text-[#CBD5E1] text-xs mt-1">Probeer een andere zoekterm</p>}
                      </td>
                    </tr>
                  ) : pageUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A] text-sm">{u.name ?? '—'}</div>
                        <div className="text-[#94A3B8] text-xs">{u.email}</div>
                        {u.phone && <div className="text-[#94A3B8] text-xs">{u.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{u.organizationName ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_BADGE[u.role] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{u.tourCount}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{u.sessionCount}</td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {new Date(u.createdAt).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <AdminActionButton
                            label="Magic Link"
                            apiUrl={`/api/admin/gebruikers/${u.id}`}
                            method="PATCH"
                            body={{ action: 'send_magic_link' }}
                            variant="ghost"
                            icon={<Mail className="w-3 h-3" />}
                            onSuccess={() => toast.success(`Magic link gestuurd naar ${u.email}`)}
                          />
                          {u.role !== 'admin' && (
                            <AdminActionButton
                              label="Admin"
                              apiUrl={`/api/admin/gebruikers/${u.id}`}
                              method="PATCH"
                              body={{ action: 'promote' }}
                              variant="ghost"
                              icon={<Shield className="w-3 h-3" />}
                              confirmMessage={`${u.email} admin-rechten geven?`}
                              onSuccess={() => {
                                toast.success(`${u.email} is nu admin`)
                                load(search)
                              }}
                            />
                          )}
                          {u.role !== 'deactivated' && (
                            <AdminActionButton
                              label="Deactiveer"
                              apiUrl={`/api/admin/gebruikers/${u.id}`}
                              method="PATCH"
                              body={{ action: 'deactivate' }}
                              variant="danger"
                              icon={<UserX className="w-3 h-3" />}
                              confirmMessage={`${u.email} deactiveren?`}
                              onSuccess={() => {
                                toast.success(`${u.email} gedeactiveerd`)
                                load(search)
                              }}
                            />
                          )}
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
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, gebruikers.length)} van {gebruikers.length}
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
