'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

function LoginForm() {
  const [tab, setTab] = useState<'magic' | 'password'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/spelleider/dashboard'

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setError('')
    await signIn('nodemailer', { email, callbackUrl, redirect: false })
    setSent(true)
    setIsSending(false)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setError('')

    const result = await signIn('customer-credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Onbekend e-mailadres of onjuist wachtwoord.')
      setIsSending(false)
    } else {
      router.push(callbackUrl)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#00C853]" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] mb-2">Check je inbox</h1>
          <p className="text-sm text-[#64748B]">
            We hebben een inloglink gestuurd naar <strong className="text-[#0F172A]">{email}</strong>.
            Klik op de link in de e-mail om in te loggen.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/images/IctusGo.png" alt="IctusGo" width={150} height={45} className="h-10 w-auto" />
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">Inloggen</p>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1 mb-4">
          <button
            type="button"
            onClick={() => { setTab('password'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'password'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
            Wachtwoord
          </button>
          <button
            type="button"
            onClick={() => { setTab('magic'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'magic'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
            Inloglink
          </button>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
          {tab === 'password' ? (
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="email-pw"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2"
                >
                  E-mailadres
                </label>
                <input
                  id="email-pw"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@bedrijf.nl"
                  required
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-[#0F172A] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2"
                >
                  Wachtwoord
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Groen-847-Blauw"
                    required
                    className="w-full px-4 py-3 pr-11 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-[#0F172A] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSending || !email || !password}
                className="w-full py-3.5 bg-[#00E676] text-[#0F172A] rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#00C853] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {isSending ? 'Inloggen...' : 'Inloggen'}
              </button>

              <p className="text-center text-xs text-[#94A3B8] leading-relaxed">
                Je wachtwoord staat in de bevestigingsmail van je boeking.
              </p>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label
                  htmlFor="email-magic"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2"
                >
                  E-mailadres
                </label>
                <input
                  id="email-magic"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@bedrijf.nl"
                  required
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] text-[#0F172A] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !email}
                className="w-full py-3.5 bg-[#00E676] text-[#0F172A] rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#00C853] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {isSending ? 'Versturen...' : 'Stuur inloglink'}
              </button>

              <p className="text-center text-xs text-[#94A3B8] leading-relaxed">
                Je ontvangt een eenmalige inloglink per e-mail.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="text-[#94A3B8] text-sm">Laden...</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
