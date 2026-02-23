import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import Link from 'next/link'
import { Clock, Users, MapPin, Zap, Star, ArrowRight, Navigation } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const VARIANT_LABELS: Record<string, string> = {
  wijktocht: 'WijkTocht',
  impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht',
  jeugdtocht: 'JeugdTocht',
  voetbalmissie: 'VoetbalMissie',
}

const VARIANT_COLORS: Record<string, string> = {
  wijktocht: 'bg-[#DCFCE7] text-[#166534]',
  impactsprint: 'bg-blue-50 text-blue-700',
  familietocht: 'bg-orange-50 text-orange-700',
  jeugdtocht: 'bg-purple-50 text-purple-700',
  voetbalmissie: 'bg-[#0F172A] text-[#00E676]',
}

const VARIANT_DESCRIPTIONS: Record<string, string> = {
  wijktocht: 'GPS checkpoints + sociale opdrachten voor bedrijven',
  impactsprint: 'Compact format, 5 checkpoints, 500m radius',
  familietocht: 'Gezinnen en weekenden, Familie Geluksscore',
  jeugdtocht: '9-13 jaar, Flits-assistent, veilig en leuk',
  voetbalmissie: '9-12 jaar, voetbal-thema, 5 checkpoints, 90 min',
}

export default async function TochtenMarketplace() {
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
      checkpointCount: count(checkpoints.id),
    })
    .from(tours)
    .leftJoin(checkpoints, eq(checkpoints.tourId, tours.id))
    .where(and(eq(tours.isPublished, true)))
    .groupBy(tours.id)
    .orderBy(tours.createdAt)

  const variants = ['alle', ...new Set(rows.map((r) => r.variant))]

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero banner */}
      <div className="bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #00E676 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00E676 0%, transparent 40%)' }}
        />
        <div className="max-w-5xl mx-auto px-6 py-16 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#00E676] rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
            </div>
            <span className="text-[#00E676] font-bold tracking-widest text-sm uppercase">ImpactTocht</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
            KIES JOUW TOCHT
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-xl leading-relaxed">
            GPS-gestuurde teambuilding met echte sociale impact. Boek direct, start dezelfde dag nog.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { icon: Zap, label: 'Klaar in 5 min' },
              { icon: Users, label: 'Tot 50 teams' },
              { icon: Star, label: 'Hoge impact gegarandeerd' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#00E676]" />
                <span className="text-[#CBD5E1] text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {variants.map((v) => (
            <Link
              key={v}
              href={v === 'alle' ? '/tochten' : `/tochten?variant=${v}`}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#00E676] hover:text-[#0F172A] transition-colors"
            >
              {v === 'alle' ? 'Alle tochten' : VARIANT_LABELS[v] ?? v}
            </Link>
          ))}
        </div>

        {/* Tochten grid */}
        {rows.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-[#CBD5E1]" />
            </div>
            <p className="text-[#64748B] font-semibold">Nog geen tochten beschikbaar</p>
            <p className="text-[#94A3B8] text-sm mt-1">Kom snel terug!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rows.map((tour) => {
              const isFree = (tour.priceInCents ?? 0) === 0 && tour.pricingModel === 'flat'
              const isPerPerson = tour.pricingModel === 'per_person'

              return (
                <Link
                  key={tour.id}
                  href={`/tochten/${tour.id}`}
                  className="group bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-lg hover:border-[#00E676]/40 transition-all overflow-hidden"
                >
                  {/* Kaart header */}
                  <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5"
                      style={{ backgroundImage: 'radial-gradient(circle, #00E676 0%, transparent 70%)' }}
                    />
                    <div className="flex items-start justify-between mb-4 relative">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${VARIANT_COLORS[tour.variant] ?? 'bg-gray-100 text-gray-700'}`}>
                        {VARIANT_LABELS[tour.variant] ?? tour.variant}
                      </span>
                      {isFree ? (
                        <span className="text-[#00E676] font-black text-sm"
                          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                          GRATIS
                        </span>
                      ) : isPerPerson ? (
                        <div className="text-right">
                          <span className="text-white font-black text-xl"
                            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                            €{((tour.pricePerPersonCents ?? 0) / 100).toFixed(0)}
                          </span>
                          <span className="text-[#64748B] text-xs block">/persoon</span>
                        </div>
                      ) : (
                        <span className="text-white font-black text-xl"
                          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                          €{((tour.priceInCents ?? 0) / 100).toFixed(0)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-xl leading-tight"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      {tour.name}
                    </h3>
                    <p className="text-[#64748B] text-xs mt-1 line-clamp-2">
                      {VARIANT_DESCRIPTIONS[tour.variant]}
                    </p>
                  </div>

                  {/* Kaart body */}
                  <div className="p-5">
                    {tour.description && (
                      <p className="text-[#64748B] text-sm leading-relaxed mb-4 line-clamp-2">
                        {tour.description}
                      </p>
                    )}

                    {/* Stats rij */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span className="text-xs text-[#64748B] font-medium">
                          {formatDuration(tour.estimatedDurationMin ?? 120)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span className="text-xs text-[#64748B] font-medium">
                          {tour.checkpointCount} checkpoints
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span className="text-xs text-[#64748B] font-medium">
                          max {tour.maxTeams} teams
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#CBD5E1]">Boek direct →</span>
                      <div className="w-8 h-8 rounded-full bg-[#F1F5F9] group-hover:bg-[#00E676] flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Vertrouwenssignalen */}
        <div className="mt-16 pt-10 border-t border-[#E2E8F0]">
          <p className="text-center text-xs text-[#94A3B8] mb-6 uppercase tracking-wider font-semibold">Veilig betalen via</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {['iDEAL', 'Bancontact', 'Creditcard', 'PayPal'].map((method) => (
              <div key={method} className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg">
                <span className="text-[#64748B] text-sm font-medium">{method}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#CBD5E1] mt-6">
            Betaald via MultiSafepay · SSL beveiligd · AVG-compliant
          </p>
        </div>
      </div>
    </main>
  )
}
