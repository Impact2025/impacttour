'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation, Target, CheckCircle2, XCircle } from 'lucide-react'

const VOETBALCLUB_NAMEN = [
  'Ajax', 'Feyenoord', 'PSV', 'AZ', 'Vitesse',
  'FC Utrecht', 'Heracles', 'NEC', 'Twente', 'Heerenveen',
]

type SessionPreview = {
  variant: string
  tourName: string
  status: string
  preCreatedTeams: string[]
}

type RecoveredTeam = { teamName: string; sessionId: string }

export default function JoinForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [code, setCode] = useState(
    (searchParams.get('code') ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  )
  const [teamName, setTeamName] = useState(searchParams.get('team') ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionPreview, setSessionPreview] = useState<SessionPreview | null>(null)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle')
  const [recoveredTeam, setRecoveredTeam] = useState<RecoveredTeam | null>(null)

  // Token recovery: check sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem('teamToken')
    const storedSessionId = sessionStorage.getItem('sessionId')
    if (!token || !storedSessionId) return
    fetch(`/api/game/session/${storedSessionId}`, { headers: { 'x-team-token': token } })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => {
        if (data?.team?.name) setRecoveredTeam({ teamName: data.team.name, sessionId: storedSessionId })
      })
      .catch(() => {
        sessionStorage.removeItem('teamToken')
        sessionStorage.removeItem('sessionId')
      })
  }, [])

  useEffect(() => {
    if (code.length !== 6) {
      setSessionPreview(null)
      setPreviewStatus('idle')
      return
    }
    setPreviewStatus('loading')
    fetch(`/api/game/preview?code=${code}`)
      .then((r) => {
        if (!r.ok) { setPreviewStatus('not-found'); return null }
        return r.json()
      })
      .then((data: SessionPreview | null) => {
        if (!data) return
        setSessionPreview(data)
        setPreviewStatus('found')
        if (data?.preCreatedTeams?.length && !searchParams.get('team')) setTeamName('')
      })
      .catch(() => { setSessionPreview(null); setPreviewStatus('not-found') })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const isFootball = sessionPreview?.variant === 'voetbalmissie'
  const hasPreCreatedTeams = (sessionPreview?.preCreatedTeams?.length ?? 0) > 0

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: code.toUpperCase(), teamName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Kan niet deelnemen. Controleer de code.')
        return
      }

      sessionStorage.setItem('teamToken', data.teamToken)
      sessionStorage.setItem('teamId', data.teamId)
      sessionStorage.setItem('sessionId', data.sessionId)

      router.push(`/game/${data.sessionId}`)
    } catch {
      setError('Verbindingsfout. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const Icon = isFootball ? Target : Navigation
  const iconBg = isFootball ? 'bg-green-500/15' : 'bg-[#00E676]/15'
  const iconColor = isFootball ? 'text-green-400' : 'text-[#00E676]'

  // Token recovery card
  if (recoveredTeam) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full animate-scale-in">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#00C853]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Welkom terug!</h2>
                <p className="text-sm text-[#64748B]">Team: <strong className="text-[#0F172A]">{recoveredTeam.teamName}</strong></p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/game/${recoveredTeam.sessionId}`)}
              className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-bold text-sm uppercase tracking-wide mb-3 active:scale-95 transition-transform"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Verdergaan met tocht
            </button>
            <button
              onClick={() => setRecoveredTeam(null)}
              className="w-full py-3 text-center text-[#94A3B8] text-sm hover:text-[#64748B] transition-colors"
            >
              Ander team / andere tocht
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isFootball ? 'bg-[#0A1A0A]' : 'bg-[#F8FAFC]'
    }`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />
            </div>
          </div>
          <h2 className={`text-2xl font-bold mb-1 ${isFootball ? 'text-white' : 'text-[#0F172A]'}`}>
            {isFootball ? 'De VoetbalMissie' : 'Doe mee aan de tocht'}
          </h2>
          {sessionPreview?.tourName && (
            <p className={`text-sm font-medium mt-1 ${isFootball ? 'text-green-400' : 'text-[#00C853]'}`}>
              {sessionPreview.tourName}
            </p>
          )}
          <p className={`mt-1 text-sm ${isFootball ? 'text-green-600' : 'text-[#94A3B8]'}`}>
            {hasPreCreatedTeams
              ? 'Kies jouw team'
              : isFootball
              ? 'Kies een clubnaam voor jullie team'
              : 'Voer de code in die je spelleider heeft gegeven'}
          </p>
        </div>

        {/* Form card */}
        <div className={`rounded-2xl p-6 shadow-sm ${
          isFootball ? 'bg-[#0F1F0F] border border-green-800/50' : 'bg-white border border-[#E2E8F0]'
        }`}>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                isFootball ? 'text-green-500' : 'text-[#64748B]'
              }`}>
                Teamcode
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="ABC123"
                  maxLength={6}
                  required
                  className={`w-full px-4 py-4 pr-12 text-center text-3xl font-bold tracking-widest border-2 rounded-xl focus:outline-none uppercase transition-colors ${
                    isFootball
                      ? 'bg-[#0A1A0A] border-green-800 text-white focus:border-green-500 placeholder-green-900'
                      : previewStatus === 'found'
                      ? 'border-[#00E676] text-[#0F172A]'
                      : previewStatus === 'not-found'
                      ? 'border-red-300 text-[#0F172A]'
                      : 'border-[#E2E8F0] focus:border-[#00E676] text-[#0F172A]'
                  }`}
                />
                {previewStatus === 'loading' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className={`w-5 h-5 border-2 rounded-full animate-spin ${isFootball ? 'border-green-700 border-t-green-400' : 'border-[#E2E8F0] border-t-[#00E676]'}`} />
                  </div>
                )}
                {previewStatus === 'found' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none animate-fade-in">
                    <CheckCircle2 className={`w-5 h-5 ${isFootball ? 'text-green-400' : 'text-[#00C853]'}`} />
                  </div>
                )}
                {previewStatus === 'not-found' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none animate-fade-in">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Teamkeuze: lijst van vooraf aangemaakte teams */}
            {hasPreCreatedTeams ? (
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isFootball ? 'text-green-500' : 'text-[#64748B]'
                }`}>
                  Jouw team
                </label>
                <div className="space-y-2">
                  {sessionPreview!.preCreatedTeams.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setTeamName(name)}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-left font-semibold text-sm transition-all ${
                        teamName === name
                          ? isFootball
                            ? 'bg-green-500 border-green-500 text-black'
                            : 'bg-[#00E676] border-[#00E676] text-[#0F172A]'
                          : isFootball
                            ? 'bg-[#0A1A0A] border-green-800 text-green-300 hover:border-green-600'
                            : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#00E676]/50'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Vrije teamnaam invoer (geen vooraf aangemaakte teams) */
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isFootball ? 'text-green-500' : 'text-[#64748B]'
                }`}>
                  {isFootball ? 'Clubnaam van jullie team' : 'Teamnaam'}
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={isFootball ? 'Ajax, PSV, Feyenoord...' : 'Team Avontuur'}
                  maxLength={30}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    isFootball
                      ? 'bg-[#0A1A0A] border-green-800 text-white focus:ring-green-600 placeholder-green-900'
                      : 'border-[#E2E8F0] focus:ring-[#00E676]/30 text-[#0F172A]'
                  }`}
                />
                {isFootball && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {VOETBALCLUB_NAMEN.map((club) => (
                      <button
                        key={club}
                        type="button"
                        onClick={() => setTeamName(club)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          teamName === club
                            ? 'bg-green-500 border-green-500 text-black font-bold'
                            : 'border-green-800 text-green-500 hover:bg-green-900'
                        }`}
                      >
                        {club}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || code.length < 6 || !teamName}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                isFootball
                  ? 'bg-green-500 text-black hover:bg-green-400'
                  : 'bg-[#00E676] text-[#0F172A] hover:bg-[#00C853]'
              }`}
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {isLoading
                ? 'Deelnemen...'
                : isFootball
                ? 'De missie starten'
                : 'Deelnemen aan tocht'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
