import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Clock, Users, MapPin, ArrowLeft,
  Target, Star, Shield, CheckCircle2,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'

const VARIANT_LABELS: Record<string, string> = {
  wijktocht: 'WijkTocht',
  impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht',
  jeugdtocht: 'JeugdTocht',
  voetbalmissie: 'VoetbalMissie',
}

const MISSION_TYPE_LABELS: Record<string, string> = {
  opdracht: '✍️ Opdracht',
  foto: '📸 Foto',
  quiz: '❓ Quiz',
  video: '🎥 Video',
}


export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, id), eq(tours.isPublished, true)),
  })

  if (!tour) notFound()

  const cps = await db
    .select()
    .from(checkpoints)
    .where(eq(checkpoints.tourId, id))
    .orderBy(asc(checkpoints.orderIndex))

  const isFree = (tour.priceInCents ?? 0) === 0 && tour.pricingModel === 'flat'
  const isPerPerson = tour.pricingModel === 'per_person'

  const totalGms = cps.reduce(
    (sum, cp) => sum + cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth,
    0
  )

  const gmsDimensions = [
    { key: 'gmsConnection' as const, label: 'Verbinding', color: '#00E676', bgColor: '#DCFCE7', desc: 'Samen zijn, nieuwe mensen ontmoeten' },
    { key: 'gmsMeaning' as const, label: 'Betekenis', color: '#38BDF8', bgColor: '#E0F2FE', desc: 'Zinvol bezig zijn voor de buurt' },
    { key: 'gmsJoy' as const, label: 'Plezier', color: '#F59E0B', bgColor: '#FEF3C7', desc: 'Lachen, spelen en genieten' },
    { key: 'gmsGrowth' as const, label: 'Groei', color: '#A78BFA', bgColor: '#EDE9FE', desc: 'Iets nieuws leren of ontdekken' },
  ]

  const gmsPerDimension = gmsDimensions.map((dim) => ({
    ...dim,
    total: cps.reduce((sum, cp) => sum + cp[dim.key], 0),
  }))

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #00E676 0%, transparent 50%)' }}
        />
        <div className="max-w-3xl mx-auto px-6 py-10 relative">
          <Link href="/tochten" className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#00E676] text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Terug naar overzicht
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold text-[#00E676] uppercase tracking-widest mb-2 block">
                {VARIANT_LABELS[tour.variant] ?? tour.variant}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                {tour.name}
              </h1>
              {tour.description && (
                <p className="text-[#94A3B8] mt-3 max-w-lg leading-relaxed">{tour.description}</p>
              )}
            </div>

            {/* Prijs badge */}
            <div className="bg-[#1E293B] rounded-2xl p-5 text-center min-w-[120px] border border-[#334155]">
              {isFree ? (
                <>
                  <div className="text-[#00E676] font-black text-3xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                    GRATIS
                  </div>
                  <div className="text-[#64748B] text-xs mt-1">geen kosten</div>
                </>
              ) : isPerPerson ? (
                <>
                  <div className="text-white font-black text-3xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                    €{((tour.pricePerPersonCents ?? 0) / 100).toFixed(0)}
                  </div>
                  <div className="text-[#64748B] text-xs mt-1">per persoon</div>
                </>
              ) : (
                <>
                  <div className="text-white font-black text-3xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                    €{((tour.priceInCents ?? 0) / 100).toFixed(0)}
                  </div>
                  <div className="text-[#64748B] text-xs mt-1">per sessie</div>
                </>
              )}
            </div>
          </div>

          {/* Kenmerken */}
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { Icon: Clock, text: formatDuration(tour.estimatedDurationMin ?? 120) },
              { Icon: MapPin, text: `${cps.length} checkpoints` },
              { Icon: Users, text: `max ${tour.maxTeams} teams` },
              { Icon: Target, text: `${totalGms} GMS punten` },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-[#1E293B] px-3 py-2 rounded-lg">
                <Icon className="w-3.5 h-3.5 text-[#00E676]" />
                <span className="text-[#CBD5E1] text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geluksmomenten Score — full-width band */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Star className="w-4 h-4 text-[#F59E0B]" />
                Geluksmomenten Score
              </h2>
              <p className="text-[#64748B] text-xs mt-0.5">
                Elke opdracht scoort op 4 dimensies van welzijn — samen optellen tot de GMS.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                {totalGms} <span className="text-[#00E676]">pt</span>
              </div>
              <div className="text-[10px] text-[#94A3B8]">max te behalen</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gmsPerDimension.map((dim) => {
              const pct = totalGms > 0 ? Math.round((dim.total / totalGms) * 100) : 0
              return (
                <div key={dim.key} className="rounded-xl p-3" style={{ background: dim.bgColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0F172A]">{dim.label}</span>
                    <span className="text-xs font-black" style={{ color: dim.color }}>{dim.total} pt</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/60 overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: dim.color }} />
                  </div>
                  <p className="text-[10px] text-[#64748B] leading-snug">{dim.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Links: checkpoints + GMS */}
          <div className="md:col-span-2 space-y-8">

            {/* Checkpoints preview */}
            <section>
              <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00E676]" />
                Checkpoints
              </h2>
              <div className="space-y-3">
                {cps.map((cp, i) => {
                  const totalCpGms = cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth
                  return (
                    <div key={cp.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#00E676] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[#0F172A] font-black text-xs">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-[#0F172A] text-sm">{cp.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#94A3B8]">
                                {MISSION_TYPE_LABELS[cp.missionType] ?? cp.missionType}
                              </span>
                              <span className="text-xs font-bold text-[#00C853] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                                +{totalCpGms} pt
                              </span>
                            </div>
                          </div>
                          <p className="text-[#94A3B8] text-xs mt-1 line-clamp-2">{cp.missionTitle}</p>

                          {/* GMS mini breakdown */}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {gmsDimensions.map(({ key, label, color }) => {
                              const val = cp[key]
                              if (val === 0) return null
                              return (
                                <div key={key} className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                  <span className="text-[10px] text-[#94A3B8]">{label} {val}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

          </div>

          {/* Rechts: boek sidebar */}
          <div className="space-y-4">
            {/* Boek kaart */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sticky top-6">
              <div className="text-center mb-5">
                {isFree ? (
                  <div>
                    <div className="text-[#00E676] font-black text-4xl"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      GRATIS
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">geen betaling nodig</p>
                  </div>
                ) : isPerPerson ? (
                  <div>
                    <div className="text-[#0F172A] font-black text-4xl"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      €{((tour.pricePerPersonCents ?? 0) / 100).toFixed(0)}
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">per deelnemer</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-[#0F172A] font-black text-4xl"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      €{((tour.priceInCents ?? 0) / 100).toFixed(0)}
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">voor de hele groep</p>
                  </div>
                )}
              </div>

              <Link
                href={`/tochten/${tour.id}/boeken`}
                className="block w-full py-4 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-center text-sm uppercase tracking-wide hover:bg-[#00C853] transition-colors"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Nu boeken →
              </Link>

              {!isFree && (
                <p className="text-center text-xs text-[#94A3B8] mt-3">
                  Couponcode? Invullen bij boeking
                </p>
              )}

              <div className="mt-5 space-y-2.5">
                {[
                  'Klaar in 5 minuten',
                  'Geen account vooraf nodig',
                  'Magic link per e-mail',
                  'Geld-terug garantie',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                    <span className="text-xs text-[#64748B]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Veiligheid */}
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#00C853]" />
                <span className="text-sm font-semibold text-[#166534]">Veilig betalen</span>
              </div>
              <p className="text-xs text-[#4ADE80] leading-relaxed">
                SSL beveiligd via MultiSafepay. iDEAL, Bancontact, creditcard en meer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
