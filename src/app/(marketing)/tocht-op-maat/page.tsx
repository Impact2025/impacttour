import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import TochtWizardClient from './tocht-wizard-client'

export const metadata: Metadata = {
  title: 'Tocht op Maat — IctusGo',
  description:
    'Laat AI een gepersonaliseerde GPS-tocht genereren voor jouw groep. Kies je groepstype, sfeer en stad — en ontvang in seconden een complete tocht met missies, locaties en impact-momenten.',
}

export default function TochtOpMaatPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#0F172A] pt-16 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00E676]/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E676]/15 text-[#00E676] text-xs font-bold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            AI-gegenereerde tocht in 30 seconden
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            Jouw Tocht op Maat
          </h1>
          <p className="text-[#94A3B8] text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Vertel ons wie je bent en wat je wil beleven. Onze AI stelt een complete GPS-tocht
            samen — inclusief missies, locaties en impact-momenten.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section className="bg-[#F8FAFC] px-4 py-12">
        <TochtWizardClient />
      </section>

      {/* Social proof */}
      <section className="bg-white px-4 py-12 text-center border-t border-[#E2E8F0]">
        <div className="max-w-lg mx-auto">
          <p className="text-[#64748B] text-sm">
            De gegenereerde tocht is een inspiratie-concept. Wil je een volledig uitgewerkte tocht
            met GPS-coördinaten en spelleider-dashboard?{' '}
            <Link href="/tochten" className="text-[#00E676] font-semibold hover:underline">
              Bekijk onze marketplace
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
