'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Users, Plus, Copy, Send,
  ArrowRight, Loader2, Zap, Calendar, Navigation,
} from 'lucide-react'
import { Suspense } from 'react'

type SessionData = {
  id: string
  joinCode: string
  status: string
  customSessionName: string | null
  welcomeMessage: string | null
  scheduledAt: string | null
  organizationName: string | null
  tour: { id: string; name: string; variant: string; estimatedDurationMin: number } | null
  teams: { id: string; name: string; deepLink: string }[]
  joinLink: string
}

const VARIANT_LABELS: Record<string, string> = {
  wijktocht: 'WijkTocht', impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht', jeugdtocht: 'JeugdTocht', voetbalmissie: 'VoetbalMissie',
}

function SetupContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const justPaid = searchParams.get('betaald') === '1'

  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Stap 1 state
  const [step, setStep] = useState(1)
  const [sessionName, setSessionName] = useState('')
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [isSavingStep1, setIsSavingStep1] = useState(false)
  const [step1Saved, setStep1Saved] = useState(false)

  // Stap 2 state
  const [teamInput, setTeamInput] = useState('')
  const [isBulkCreating, setIsBulkCreating] = useState(false)
  const [teams, setTeams] = useState<{ id: string; name: string; deepLink: string }[]>([])
  const [bulkResult, setBulkResult] = useState<{ created: { id: string; name: string; deepLink: string }[] } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/klant/${sessionId}/setup`)
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/klant/${sessionId}/setup`)
          return
        }
        setError('Sessie niet gevonden.')
        return
      }
      const data: SessionData = await res.json()
      setSession(data)
      setSessionName(data.customSessionName || data.tour?.name || '')
      setWelcomeMsg(data.welcomeMessage || '')
      setTeams(data.teams)
    } catch {
      setError('Kon sessie niet laden.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, router])

  useEffect(() => { load() }, [load])

  const saveStep1 = async () => {
    setIsSavingStep1(true)
    try {
      await fetch(`/api/klant/${sessionId}/setup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customSessionName: sessionName, welcomeMessage: welcomeMsg }),
      })
      setStep1Saved(true)
      setTimeout(() => { setStep(2); setStep1Saved(false) }, 600)
    } finally {
      setIsSavingStep1(false)
    }
  }

  const bulkCreateTeams = async () => {
    const names = teamInput
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)

    if (names.length === 0) return

    setIsBulkCreating(true)
    try {
      const res = await fetch(`/api/klant/${sessionId}/teams/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names }),
      })
      const data = await res.json()
      if (res.ok) {
        setBulkResult(data)
        const newTeams = [...teams, ...data.created]
        setTeams(newTeams)
        setTeamInput('')
      }
    } finally {
      setIsBulkCreating(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAllLinks = () => {
    if (!session) return
    const text = teams
      .map((t) => `${t.name}: ${t.deepLink}`)
      .join('\n')
    copyToClipboard(text, 'all')
  }

  const shareWhatsApp = (link: string, teamName: string) => {
    const text = encodeURIComponent(
      `Hoi! Jouw team voor ${session?.tour?.name || 'ImpactTocht'}:\n\n👉 ${link}\n\nTeamnaam: ${teamName}\nKlik op de link om direct deel te nemen!`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#00E676] animate-spin mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">Tocht laden...</p>
        </div>
      </main>
    )
  }

  if (error || !session) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-[#64748B] mb-4">{error || 'Sessie niet gevonden.'}</p>
          <button onClick={() => { setError(''); load() }} className="px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-lg font-semibold text-sm">
            Opnieuw proberen
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A]">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#00E676] rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#0F172A]" strokeWidth={2.5} />
            </div>
            <span className="text-[#00E676] text-xs font-bold uppercase tracking-widest">ImpactTocht</span>
          </div>

          {justPaid && (
            <div className="flex items-center gap-3 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl px-4 py-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
              <div>
                <p className="text-[#00E676] font-semibold text-sm">Betaling ontvangen!</p>
                <p className="text-[#4ADE80] text-xs">Je tocht is betaald en klaar om in te richten.</p>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-black text-white"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
            TOCHT INRICHTEN
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#00E676] text-xs font-bold uppercase tracking-wider">
              {VARIANT_LABELS[session.tour?.variant ?? ''] ?? session.tour?.variant}
            </span>
            <span className="text-[#334155]">·</span>
            <span className="text-[#64748B] text-sm">{session.tour?.name}</span>
          </div>
        </div>

        {/* Stap indicator */}
        <div className="max-w-2xl mx-auto px-6 pb-6">
          <div className="flex items-center gap-0">
            {[
              { n: 1, label: 'Naam & bericht' },
              { n: 2, label: 'Teams aanmaken' },
              { n: 3, label: 'Klaar!' },
            ].map(({ n, label }, i, arr) => (
              <div key={n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => n < step ? setStep(n) : undefined}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step > n ? 'bg-[#00E676] text-[#0F172A] cursor-pointer' :
                      step === n ? 'bg-[#00E676] text-[#0F172A]' :
                      'bg-[#1E293B] text-[#475569]'
                    }`}
                  >
                    {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                  </button>
                  <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${step >= n ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > n ? 'bg-[#00E676]' : 'bg-[#1E293B]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* ── STAP 1: Naam & bericht ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Geef je sessie een naam</h2>
              <p className="text-[#94A3B8] text-sm">Teams zien deze naam als ze deelnemen.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Sessienaam
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={`Teamdag ${session.organizationName || 'Jouw Bedrijf'}`}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Welkomstbericht voor teams (optioneel)
                </label>
                <textarea
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
                  placeholder="Welkom bij onze teamdag! Veel plezier en succes bij de opdrachten. 🎯"
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm resize-none"
                />
                <p className="text-xs text-[#CBD5E1] mt-1 text-right">{welcomeMsg.length}/300</p>
              </div>

              {session.scheduledAt && (
                <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                  <Calendar className="w-4 h-4 text-[#00E676]" />
                  <span className="text-sm text-[#64748B]">
                    Gepland: <strong className="text-[#0F172A]">
                      {new Date(session.scheduledAt).toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={saveStep1}
              disabled={!sessionName || isSavingStep1}
              className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#00C853] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {isSavingStep1 ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Opslaan...</>
              ) : step1Saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Opgeslagen!</>
              ) : (
                <>Opslaan & volgende stap <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}

        {/* ── STAP 2: Teams aanmaken ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Teams aanmaken</h2>
              <p className="text-[#94A3B8] text-sm">
                Maak teams vooraf aan (aanbevolen) of deel alleen de code zodat teams zichzelf aanmelden.
              </p>
            </div>

            {/* Join code kaart */}
            <div className="bg-[#0F172A] rounded-2xl p-5">
              <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider mb-3">Deelnemers sturen naar</p>
              <div className="flex items-center gap-3 bg-[#1E293B] rounded-xl p-4 mb-3">
                <div className="flex-1">
                  <p className="text-[#94A3B8] text-xs mb-1">Teamcode</p>
                  <p className="text-white font-black tracking-[0.3em] text-2xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                    {session.joinCode}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(session.joinCode, 'code')}
                  className="p-3 bg-[#2D3F54] rounded-lg hover:bg-[#334155] transition-colors"
                >
                  {copied === 'code' ? <CheckCircle2 className="w-4 h-4 text-[#00E676]" /> : <Copy className="w-4 h-4 text-[#94A3B8]" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(session.joinLink, 'link')}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#1E293B] rounded-xl hover:bg-[#2D3F54] transition-colors group"
              >
                <span className="text-[#64748B] text-sm font-mono truncate max-w-[240px]">{session.joinLink}</span>
                {copied === 'link' ? <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" /> : <Copy className="w-4 h-4 text-[#64748B] group-hover:text-[#CBD5E1] shrink-0" />}
              </button>
            </div>

            {/* Bulk team aanmaken */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#00E676]" />
                  Teams aanmaken
                </h3>
                <span className="text-xs text-[#94A3B8]">{teams.length} team{teams.length !== 1 ? 's' : ''} aangemaakt</span>
              </div>

              <textarea
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                placeholder={"Rood Team\nBlauw Team\nGroen Team\nGeel Team"}
                rows={5}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-sm resize-none font-mono"
              />
              <p className="text-xs text-[#94A3B8] mt-1 mb-3">Eén teamnaam per regel</p>

              <button
                onClick={bulkCreateTeams}
                disabled={!teamInput.trim() || isBulkCreating}
                className="w-full py-3 bg-[#0F172A] text-[#00E676] rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isBulkCreating ? <><Loader2 className="w-4 h-4 animate-spin" /> Teams aanmaken...</> : <><Users className="w-4 h-4" /> Teams aanmaken</>}
              </button>

              {bulkResult && bulkResult.created.length > 0 && (
                <div className="mt-3 p-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl">
                  <p className="text-[#166534] text-sm font-semibold">
                    ✅ {bulkResult.created.length} team{bulkResult.created.length !== 1 ? 's' : ''} aangemaakt!
                  </p>
                </div>
              )}
            </div>

            {/* Aangemaakte teams */}
            {teams.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A]">Aangemaakt teams</h3>
                  <button
                    onClick={copyAllLinks}
                    className="flex items-center gap-1.5 text-xs text-[#00C853] hover:text-[#00E676] font-medium"
                  >
                    {copied === 'all' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'all' ? 'Gekopieerd!' : 'Kopieer alle links'}
                  </button>
                </div>

                <div className="space-y-2">
                  {teams.map((team) => (
                    <div key={team.id} className="bg-white rounded-xl border border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#DCFCE7] rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-[#00C853]" />
                      </div>
                      <span className="flex-1 text-[#0F172A] font-medium text-sm">{team.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => shareWhatsApp(team.deepLink, team.name)}
                          className="p-2 text-[#94A3B8] hover:text-[#25D366] transition-colors"
                          title="Delen via WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(team.deepLink, team.id)}
                          className="p-2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                        >
                          {copied === team.id ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#00C853] transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              Naar de afrondingspagina <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STAP 3: Klaar ──────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-[#00C853]" />
              </div>
              <h2 className="text-3xl font-black text-[#0F172A] mb-2"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                ALLES STAAT KLAAR!
              </h2>
              <p className="text-[#64748B] max-w-sm mx-auto">
                Je tocht is ingericht. Op de dag zelf start je hem via het dashboard.
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-3">
              {[
                { label: `Naam: ${sessionName}`, done: !!sessionName },
                { label: `${teams.length} team${teams.length !== 1 ? 's' : ''} aangemaakt`, done: teams.length > 0 },
                { label: `Teamcode: ${session.joinCode}`, done: true },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? 'bg-[#00E676]' : 'bg-[#F1F5F9]'}`}>
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F172A]" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>{label}</span>
                </div>
              ))}
            </div>

            {/* Naar beheer */}
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/klant/${sessionId}/beheer`)}
                className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#00C853] transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                <Zap className="w-4 h-4" />
                Naar game day dashboard
              </button>

              <button
                onClick={() => router.push('/spelleider/dashboard')}
                className="w-full py-3 border border-[#E2E8F0] text-[#64748B] rounded-xl font-medium text-sm hover:border-[#CBD5E1] transition-colors"
              >
                Naar spelleider dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00E676] animate-spin" />
      </main>
    }>
      <SetupContent />
    </Suspense>
  )
}
