import Link from 'next/link'
import { FileText, TrendingUp, CheckCircle2 } from 'lucide-react'

export function HrValueProp() {
  return (
    <section className="bg-white px-4 md:px-8 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <span className="inline-block text-[10px] font-bold text-[#00E676] uppercase tracking-widest mb-3 bg-[#F0FDF4] px-3 py-1 rounded-full">
          Voor HR &amp; L&amp;D managers
        </span>
        <h2
          className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-3 italic"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
        >
          Wat neem je mee terug<br />
          <span className="text-[#00E676] not-italic">naar kantoor?</span>
        </h2>
        <p className="text-[#64748B] text-sm md:text-base max-w-xl mb-10">
          IctusGo geeft je drie concrete dingen om de investering intern te verantwoorden.
        </p>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* Column 1: PDF rapport */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-[#16a34a]" />
            </div>
            <h3 className="font-black text-[#0F172A] mb-2">PDF Impactrapport</h3>
            <p className="text-sm text-[#475569] mb-4">
              Na elke sessie ontvangt elk team automatisch een rapport met GMS-scores,
              dimensie-analyse en Coach Inzicht — professioneel genoeg om intern door te sturen.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Verbinding', 'Betekenis', 'Plezier', 'Groei'].map((d) => (
                <span
                  key={d}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-[#16a34a] border border-[#DCFCE7]"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Column 2: HR KPI's */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <h3 className="font-black text-[#0F172A] mb-2">Direct vertaalbaar naar HR KPI&apos;s</h3>
            <p className="text-sm text-[#475569] mb-4">
              De GMS-dimensies sluiten aan op bewezen HR-doelen: Verbinding op verzuimpreventie,
              Betekenis op retentie, Plezier op vitaliteit, Groei op duurzame inzetbaarheid.
            </p>
            <div className="bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-xl p-3">
              <p className="text-xs text-[#92400E] italic">
                &ldquo;Een GMS ≥ 70% correleert met aantoonbaar positief effect
                op werknemersbetrokkenheid.&rdquo;
              </p>
            </div>
          </div>

          {/* Column 3: Budget verantwoorden */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <h3 className="font-black text-[#0F172A] mb-2">Eenvoudig te verantwoorden</h3>
            <ul className="space-y-2.5">
              {[
                'Transparante prijs — geen hidden costs',
                'Offerte op aanvraag voor finance',
                'Gratis demo voor max 10 personen',
                'Factuur inclusief BTW-specificatie',
                'Kosteloos annuleren tot 48 uur van tevoren',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#475569]">
                  <CheckCircle2 className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA strip */}
        <div className="bg-[#0F172A] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-white font-bold text-lg">Klaar om het intern voor te stellen?</p>
            <p className="text-[#64748B] text-sm mt-1">
              Plan een 20-minuten gesprek of bekijk de volledige GMS-methodiek.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/contact?subject=hr-gesprek"
              className="px-5 py-3 rounded-xl bg-[#00E676] text-[#0F172A] font-bold text-sm hover:bg-[#00C853] transition-colors"
            >
              Plan gesprek
            </Link>
            <Link
              href="/impact"
              className="px-5 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Bekijk GMS methodiek
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
