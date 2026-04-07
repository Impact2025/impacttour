'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Probeer eerst admin-credentials (env var), dan customer-credentials (DB)
    let result = await signIn('admin-credentials', { email, password, redirect: false })
    if (result?.error) {
      result = await signIn('customer-credentials', { email, password, redirect: false })
    }

    if (result?.error) {
      setError('Onbekend e-mailadres of onjuist wachtwoord.')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00E676] rounded-2xl mb-4">
            <span className="text-[#0F172A] font-black text-lg">IG</span>
          </div>
          <h1 className="text-white font-bold text-xl">Admin inloggen</h1>
          <p className="text-[#475569] text-sm mt-1">IctusGo beheerportaal</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ictusgo.nl"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00E676]/40 focus:border-[#00E676] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00E676]/40 focus:border-[#00E676] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 bg-[#00E676] text-[#0F172A] rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#00C853] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Inloggen...' : 'Inloggen als admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#334155] mt-6">
          IctusGo Admin — alleen voor bevoegd personeel
        </p>
      </div>
    </main>
  )
}
