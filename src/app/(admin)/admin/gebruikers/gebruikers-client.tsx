'use client'

import { useState, useEffect } from 'react'
import { AdminActionButton } from '@/components/admin/admin-action-button'
import { Search, X, Mail, Shield, UserX } from 'lucide-react'

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

export function GebruikersClient() {
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async (q = search) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const res = await fetch(`/api/admin/gebruikers?${params.toString()}`)
    if (res.ok) setGebruikers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => load(search), 400)
    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const ROLE_BADGE: Record<string, string> = {
    admin: 'bg-[#DCFCE7] text-[#166534]',
    spelleider: 'bg-[#DBEAFE] text-[#1D4ED8]',
    deactivated: 'bg-[#F1F5F9] text-[#94A3B8]',
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4 w-72">
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

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#94A3B8]">Laden...</div>
        ) : (
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
                {gebruikers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-[#94A3B8]">Geen gebruikers gevonden</td></tr>
                ) : gebruikers.map(u => (
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
                    <td className="px-4 py-3 text-xs text-[#64748B]">{new Date(u.createdAt).toLocaleDateString('nl-NL')}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <AdminActionButton
                          label="Magic Link"
                          apiUrl={`/api/admin/gebruikers/${u.id}`}
                          method="PATCH"
                          body={{ action: 'send_magic_link' }}
                          variant="ghost"
                          icon={<Mail className="w-3 h-3" />}
                          onSuccess={() => alert(`Magic link gestuurd naar ${u.email}`)}
                        />
                        {u.role !== 'admin' && (
                          <AdminActionButton
                            label="Admin"
                            apiUrl={`/api/admin/gebruikers/${u.id}`}
                            method="PATCH"
                            body={{ action: 'promote' }}
                            variant="ghost"
                            icon={<Shield className="w-3 h-3" />}
                            confirmMessage={`${u.email} admin maken?`}
                            onSuccess={() => load()}
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
                            onSuccess={() => load()}
                          />
                        )}
                      </div>
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
