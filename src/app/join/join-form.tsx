'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation, Target, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react'

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
    (searchParams.get('code') ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
  )
  const [teamName, setTeamName] = useState(searchParams.get('team') ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionPreview, setSessionPreview] = useState<SessionPreview | null>(null)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle')
  const [recoveredTeam, setRecoveredTeam] = useState<RecoveredTeam | null>(null)

  // Token recovery
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
    if (code.length < 4) {
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
      if (!res.ok) { setError(data.error || 'Kan niet deelnemen. Controleer de code.'); return }
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
  const bg = isFootball ? 'bg-[#0A1A0A]' : 'bg-[#F8FAFC]'
  const cardBg = isFootball ? 'bg-[#0F1F0F] border-green-800/50' : 'bg-white border-[#E2E8F0]'
  const accentColor = isFootball ? '#00C853' : '#00E676'
  const textPrimary = isFootball ? 'text-white' : 'text-[#0F172A]'
  const inputBase = isFootball
    ? 'bg-[#0A1A0A] border-green-800 text-white placeholder-green-900 focus:border-green-500'
    : 'border-[#E2E8F0] text-[#0F172A] focus:border-[#00E676]'

  // Token recovery card
  if (recoveredTeam) {
    return (
      <main className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className="max-w-md w-full">
          <div className={`rounded-2xl border p-6 ${cardBg}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#00C853]" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${textPrimary}`}>Welkom terug!</h2>
                <p className={`text-sm ${isFootball ? 'text-green-400' : 'text-[#64748B]'}`}>
                  Team: <strong className={textPrimary}>{recoveredTeam.teamName}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/game/${recoveredTeam.sessionId}`)}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wide mb-3 active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: accentColor,
                color: '#0F172A',
                fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
              }}
            >
              Verdergaan met tocht <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRecoveredTeam(null)}
              className={`w-full py-3 text-center text-sm transition-colors ${isFootball ? 'text-green-600 hover:text-green-400' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
            >
              Ander team / andere tocht
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 transition-colors ${bg}`}>
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Icon className="w-7 h-7" style={{ color: accentColor }} strokeWidth={2} />
            </div>
          </div>
          <h1
            className={`text-2xl font-bold mb-1 ${textPrimary}`}
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            {isFootball ? 'De VoetbalMissie' : 'Doe mee aan de tocht'}
          </h1>

          {/* Session preview */}
          {previewStatus === 'found' && sessionPreview?.tourName && (
            <div
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {sessionPreview.tourName}
            </div>
          )}

          <p className={`mt-2 text-sm ${isFootball ? 'text-green-600' : 'text-[#94A3B8]'}`}>
            {hasPreCreatedTeams
              ? 'Kies jouw team hieronder'
              : isFootball
              ? 'Kies een clubnaam voor jullie team'
              : 'Voer de teamcode in die je spelleider heeft gegeven'}
          </p>
        </div>

        {/* Form card */}
        <div className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
          <form onSubmit={handleJoin} className="space-y-4">

            {/* Teamcode */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isFootball ? 'text-green-500' : 'text-[#64748B]'}`}>
                Teamcode
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="ABC123"
                  maxLength={10}
                  required
                  autoCapitalize="characters"
                  autoComplete="off"
                  className={`w-full px-4 py-4 pr-12 text-center text-3xl font-black tracking-[0.25em] border-2 rounded-xl focus:outline-none uppercase transition-colors ${
                    previewStatus === 'found'
                      ? `${isFootball ? 'border-green-500 bg-green-900/20' : 'border-[#00E676] bg-[#F0FDF4]'}`
                      : previewStatus === 'not-found'
                      ? 'border-red-400'
                      : inputBase
                  }`}
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  {previewStatus === 'loading' && (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: accentColor }} />
                  )}
                  {previewStatus === 'found' && (
                    <CheckCircle2 className="w-5 h-5" style={{ color: accentColor }} />
                  )}
                  {previewStatus === 'not-found' && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
              {previewStatus === 'not-found' && (
                <p className="text-xs text-red-500 mt-1.5">Code niet gevonden. Controleer de code bij je spelleider.</p>
              )}
            </div>

            {/* Teamkeuze */}
            {hasPreCreatedTeams ? (
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isFootball ? 'text-green-500' : 'text-[#64748B]'}`}>
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
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isFootball ? 'text-green-500' : 'text-[#64748B]'}`}>
                  {isFootball ? 'Clubnaam van jullie team' : 'Teamnaam'}
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={isFootball ? 'Ajax, PSV, Feyenoord...' : 'Team Avontuur'}
                  maxLength={30}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm ${inputBase} ${
                    isFootball ? 'focus:ring-green-600' : 'focus:ring-[#00E676]/30'
                  }`}
                />
                {isFootball && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {VOETBALCLUB_NAMEN.map((club) => (
                      <button
                        key={club}
                        type="button"
                        onClick={() => setTeamName(club)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                          teamName === club
                            ? 'bg-green-500 border-green-500 text-black font-bold'
                            : 'border-green-800 text-green-500 hover:bg-green-900/50'
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
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || code.length < 4 || !teamName}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              style={{
                backgroundColor: isLoading || code.length < 4 || !teamName ? undefined : accentColor,
                color: '#0F172A',
                fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
              }}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Deelnemen...</>
              ) : isFootball ? (
                <>De missie starten <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Deelnemen aan tocht <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
