import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import Link from 'next/link'
import { MapPin, Sparkles, ArrowRight } from 'lucide-react'
import { TochtenFilter, type TourRow } from './tochten-filter'

export const dynamic = 'force-dynamic'

const STATS = [
  { value: '10+', label: 'Tochten beschikbaar' },
  { value: '3',   label: "Regio's: Haarlem, Heemstede, Haarlemmermeer" },
  { value: '72',  label: 'Gem. GMS impact score' },
  { value: '500+', label: 'Teams gespeeld' },
]

async function getPublishedTours(): Promise<TourRow[]> {
  const rows = await db
    .select({
      id: tours.id,
      name: tours.name,
      description: tours.description,
      variant: tours.variant,
      estimatedDurationMin: tours.estimatedDurationMin,
      maxTeams: tours.maxTeams,
      priceInCents: tours.priceInCents,
      pricingModel: tours.pricingModel,
      pricePerPersonCents: tours.pricePerPersonCents,
      aiConfig: tours.aiConfig,
      checkpointCount: count(checkpoints.id),
    })
    .from(tours)
    .leftJoin(checkpoints, eq(checkpoints.tourId, tours.id))
    .where(eq(tours.isPublished, true))
    .groupBy(tours.id)
    .orderBy(tours.createdAt)

  return rows as TourRow[]
}

export default async function TochtenMarketplace() {
  const tourList = await getPublishedTours()

  const regions = Array.from(
    new Set(tourList.map((t) => (t.aiConfig?.location as string) || null).filter(Boolean))
  )

  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00E676 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
              Marketplace — {tourList.length} tochten beschikbaar
            </span>

            <h1
              className="text-4xl md:text-6xl font-black italic text-white leading-tight mb-4"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              GPS-teambuilding met<br />
              <span style={{ color: '#00E676' }}>echte sociale impact</span>
            </h1>

            <p className="text-[#94A3B8] text-base max-w-xl leading-relaxed mb-7">
              Verbindt je team, ontdek de buurt en meet jullie sociale impact in een live GMS-score.
              Boek direct, setup klaar in 5 minuten.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {regions.map((r) => (
                <span key={r} className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                  <MapPin className="w-3 h-3 text-[#00E676]" />
                  {r}
                </span>
              ))}
              <Link
                href="/tocht-op-maat"
                className="flex items-center gap-1.5 bg-[#00E676]/10 text-[#00E676] text-xs font-bold px-3 py-1.5 rounded-full border border-[#00E676]/20 hover:bg-[#00E676]/20 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Tocht op maat
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p
                  className="text-2xl font-black text-white mb-0.5"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {value}
                </p>
                <p className="text-xs text-[#64748B] leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GMS strip ── */}
      <div className="bg-[#F0FDF4] border-b border-[#DCFCE7] px-4 md:px-8 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            <span className="text-xs font-black text-[#166534] uppercase tracking-widest">GMS Score</span>
          </div>
          <p className="text-xs text-[#15803D] leading-relaxed">
            Elke tocht meet impact via <strong>Verbinding · Betekenis · Vreugde · Groei</strong>.
            Score ≥ 70 = &ldquo;Hoge Impact&rdquo; badge + persoonlijk PDF-rapport.
          </p>
          <Link href="/impact" className="shrink-0 text-xs font-bold text-[#00C853] hover:underline flex items-center gap-1">
            Meer over GMS <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Filter + grid (client) ── */}
      <TochtenFilter tours={tourList} />

      {/* ── Maatwerk CTA ── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-white mb-3"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Geen tocht die past?<br />
            <span style={{ color: '#00E676' }}>We bouwen er één voor jou.</span>
          </h2>
          <p className="text-[#64748B] text-sm max-w-md mx-auto mb-7">
            Eigen locatie, eigen thema, eigen branding. De AI genereert een volledig tocht-concept in 60 seconden.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tocht-op-maat"
              className="inline-flex items-center gap-2 bg-[#00E676] text-[#0F172A] font-bold px-7 py-3.5 rounded-xl hover:bg-[#00C853] transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Genereer mijn tocht
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/5 transition-colors text-sm"
            >
              Plan een gesprek <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <section className="bg-white px-4 md:px-8 py-10 border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '⚡', title: 'Klaar in 5 minuten', desc: 'Boek, betaal en ontvang setup-link direct in je inbox.' },
              { emoji: '🎮', title: 'Live spelleider dashboard', desc: 'Volg alle teams op de kaart, start/pauzeer de tocht, bekijk scores.' },
              { emoji: '📋', title: 'PDF impactrapport', desc: 'Na afloop: GMS-score, coach inzicht en aanbevelingen per team.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="text-3xl shrink-0">{item.emoji}</span>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm mb-1">{item.title}</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment methods */}
          <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center">
            <p className="text-xs text-[#94A3B8] uppercase tracking-widest font-semibold mb-4">Veilig betalen via</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {['iDEAL', 'Creditcard', 'Bancontact', 'Factuur'].map((m) => (
                <div key={m} className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-[#475569] text-sm font-medium">{m}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#CBD5E1] mt-4">
              MultiSafepay · SSL beveiligd · AVG-compliant · KVK geregistreerd
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
