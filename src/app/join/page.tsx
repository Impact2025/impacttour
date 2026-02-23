'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation, Target } from 'lucide-react'

const VOETBALCLUB_NAMEN = [
  'Ajax', 'Feyenoord', 'PSV', 'AZ', 'Vitesse',
  'FC Utrecht', 'Heracles', 'NEC', 'Twente', 'Heerenveen',
]

export default function JoinPage() {
  const [code, setCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionPreview, setSessionPreview] = useState<{
    variant: string; tourName: string; status: string
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (code.length !== 6) {
      setSessionPreview(null)
      return
    }
    fetch(`/api/game/preview?code=${code}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSessionPreview(data))
      .catch(() => setSessionPreview(null))
  }, [code])

  const isFootball = sessionPreview?.variant === 'voetbalmissie'

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
            {isFootball
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
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ABC123"
                maxLength={6}
                required
                className={`w-full px-4 py-4 text-center text-3xl font-bold tracking-widest border-2 rounded-xl focus:outline-none uppercase transition-colors ${
                  isFootball
                    ? 'bg-[#0A1A0A] border-green-800 text-white focus:border-green-500 placeholder-green-900'
                    : 'border-[#E2E8F0] focus:border-[#00E676] text-[#0F172A]'
                }`}
              />
            </div>

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
