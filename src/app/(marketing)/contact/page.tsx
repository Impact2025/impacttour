'use client'

import { useState } from 'react'
import { Mail, Phone, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react'

const VARIANTS = ['WijkTocht', 'ImpactSprint', 'FamilieTocht', 'JeugdTocht', 'VoetbalMissie', 'Maatwerk']

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', organization: '', message: '', variant: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.status === 429) {
        setErrorMsg('Je hebt te veel berichten gestuurd. Probeer het later opnieuw.')
        setStatus('error')
        return
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErrorMsg(d.error || 'Er ging iets mis. Probeer het opnieuw.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Verbindingsfout. Controleer je internet en probeer opnieuw.')
      setStatus('error')
    }
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-20 border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
            We staan voor je klaar
          </span>
          <h1
            className="text-4xl md:text-6xl font-black italic text-[#0F172A] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Laten we<br />kennismaken.
          </h1>
          <p className="text-[#64748B] text-base max-w-md mx-auto">
            Heb je een vraag, wil je een demo of een offerte op maat? Wij reageren binnen 1 werkdag.
          </p>
        </div>
      </section>

      {/* ── 2-koloms ── */}
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16">

          {/* Formulier */}
          <div className="md:col-span-3">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-[#00C853]" />
                </div>
                <h2
                  className="text-2xl font-black text-[#0F172A] mb-2"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  Bericht ontvangen!
                </h2>
                <p className="text-[#64748B] text-sm max-w-sm">
                  We reageren binnen 1 werkdag op {form.email}. Tot snel!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    Naam <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jan de Vries"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-[#00E676] focus:ring-2 focus:ring-[#00E676]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    E-mailadres <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jan@organisatie.nl"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-[#00E676] focus:ring-2 focus:ring-[#00E676]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Organisatie</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    placeholder="Gemeente Rotterdam, VV Spirit, ..."
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-[#00E676] focus:ring-2 focus:ring-[#00E676]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Interesse in variant</label>
                  <select
                    value={form.variant}
                    onChange={(e) => setForm({ ...form, variant: e.target.value })}
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:border-[#00E676] focus:ring-2 focus:ring-[#00E676]/20 transition bg-white"
                  >
                    <option value="">Kies een variant (optioneel)</option>
                    {VARIANTS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    Bericht <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Vertel ons wat je nodig hebt — aantal deelnemers, locatie, datum, vragen..."
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-[#00E676] focus:ring-2 focus:ring-[#00E676]/20 transition resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-2xl font-black italic text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60 uppercase tracking-wide"
                  style={{
                    fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
                    boxShadow: '0 4px 20px rgba(0,230,118,0.30)',
                  }}
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-4 h-4" /> Verstuur bericht</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="md:col-span-2 space-y-6">

            <div>
              <h3 className="font-bold text-[#0F172A] mb-4">Direct contact</h3>
              <div className="space-y-3">
                <a
                  href="mailto:info@teambuildingmetimpact.nl"
                  className="flex items-center gap-3 p-3.5 bg-[#F8FAFC] rounded-xl hover:bg-[#F0FDF4] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#00C853]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] font-semibold">E-mail</p>
                    <p className="text-sm font-bold text-[#0F172A] group-hover:text-[#00C853] transition-colors">info@teambuildingmetimpact.nl</p>
                  </div>
                </a>

                <a
                  href="tel:+31612345678"
                  className="flex items-center gap-3 p-3.5 bg-[#F8FAFC] rounded-xl hover:bg-[#F0FDF4] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#00C853]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] font-semibold">Telefoon</p>
                    <p className="text-sm font-bold text-[#0F172A]">+31 6 12 34 56 78</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-2.5 mb-3">
                <Clock className="w-4 h-4 text-[#00C853]" />
                <p className="font-bold text-[#0F172A] text-sm">Antwoordtijd</p>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed">
                We reageren binnen <strong>1 werkdag</strong> op alle berichten.
                Urgente vragen? Stuur een WhatsApp via bovenstaand nummer.
              </p>
            </div>

            <div className="bg-[#0F172A] rounded-2xl p-5">
              <p className="text-[#00E676] text-xs font-bold uppercase tracking-widest mb-2">Liever live?</p>
              <p className="text-white font-bold text-sm mb-3">Plan een gratis kennismakingsgesprek</p>
              <p className="text-[#64748B] text-xs leading-relaxed mb-4">
                In 30 minuten laten we je zien hoe IctusGo werkt en welke variant het beste bij jou past.
              </p>
              <a
                href="mailto:info@teambuildingmetimpact.nl?subject=Demo aanvragen"
                className="inline-flex items-center gap-1.5 text-[#00E676] text-sm font-bold border border-[#00E676]/30 px-4 py-2 rounded-xl hover:bg-[#00E676]/10 transition-colors"
              >
                Stuur een mailtje
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
