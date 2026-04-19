import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Zap, Users } from 'lucide-react'
import TochtWizardClient from './tocht-wizard-client'

export const metadata: Metadata = {
  title: 'Tocht op Maat — TeambuildingMetImpact.nl',
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
          <p className="text-[#94A3B8] text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-8">
            Vertel ons wie je bent en wat je wil beleven. Onze AI stelt een complete GPS-tocht
            samen — inclusief missies, locaties en impact-momenten.
          </p>

          {/* Twee opties duidelijk naast elkaar */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
            <div className="bg-[#00E676]/10 border border-[#00E676]/25 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-[#00E676]" />
                <span className="text-[#00E676] text-xs font-black uppercase tracking-wider">Zelf doen</span>
              </div>
              <p className="text-white font-black text-lg leading-none">€49</p>
              <p className="text-[#64748B] text-[11px] mt-0.5">AI genereert, jij speelt</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span className="text-[#94A3B8] text-xs font-black uppercase tracking-wider">Wij regelen</span>
              </div>
              <p className="text-white font-black text-lg leading-none">€750</p>
              <p className="text-[#64748B] text-[11px] mt-0.5">
                <Link href="/contact" className="underline hover:text-[#94A3B8]">Vraag offerte →</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="bg-[#F8FAFC] px-4 py-12">
        <TochtWizardClient />
      </section>

      {/* Uitleg twee opties */}
      <section className="bg-white px-4 py-12 border-t border-[#E2E8F0]">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-5">
            <p className="text-[10px] font-black text-[#00C853] uppercase tracking-widest mb-2">Tocht op Maat — €49</p>
            <h3 className="font-bold text-[#0F172A] text-sm mb-2">Zelf samenstellen, direct spelen</h3>
            <p className="text-[#64748B] text-xs leading-relaxed">
              De AI genereert een complete GPS-tocht op basis van jouw input. Je betaalt eenmalig €49 en kunt de tocht direct laten spelen via het spelleider-dashboard. GPS-coördinaten, teams, join-links — alles inbegrepen.
            </p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5">
            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2">Volledig Maatwerk — vanaf €750</p>
            <h3 className="font-bold text-[#0F172A] text-sm mb-2">Wij regelen alles voor je</h3>
            <p className="text-[#64748B] text-xs leading-relaxed mb-3">
              Eigen locatie, eigen thema, eigen branding. Een consultant denkt mee, wij bouwen de tocht professioneel uit en begeleiden de uitvoering.
            </p>
            <Link href="/contact" className="text-xs font-bold text-[#00E676] hover:underline">
              Vraag een offerte aan →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
