import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Clock, Users, MapPin, ArrowLeft, ArrowRight,
  Target, Star, Shield, CheckCircle2, Camera,
  MessageSquare, FileQuestion, Video, TrendingUp, Smile, Link2, Award,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// ─── Metadata maps ────────────────────────────────────────────────────────────

const VARIANT_META: Record<string, { label: string; color: string; bg: string }> = {
  wijktocht:     { label: 'WijkTocht',     color: '#3B82F6', bg: '#EFF6FF' },
  impactsprint:  { label: 'ImpactSprint',  color: '#8B5CF6', bg: '#F5F3FF' },
  familietocht:  { label: 'FamilieTocht',  color: '#EC4899', bg: '#FDF2F8' },
  jeugdtocht:    { label: 'JeugdTocht',    color: '#F59E0B', bg: '#FFFBEB' },
  voetbalmissie: { label: 'VoetbalMissie', color: '#00C853', bg: '#F0FDF4' },
}

const MISSION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  foto: Camera, quiz: FileQuestion, opdracht: MessageSquare, video: Video,
}

const GMS_DIMS = [
  { key: 'gmsConnection' as const, label: 'Verbinding', icon: Link2,      color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'gmsMeaning'   as const, label: 'Betekenis',  icon: Award,      color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'gmsJoy'       as const, label: 'Vreugde',    icon: Smile,      color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'gmsGrowth'    as const, label: 'Groei',      icon: TrendingUp, color: '#00C853', bg: '#F0FDF4' },
]

const CP_TYPE_COLORS: Record<string, string> = {
  kennismaking: '#3B82F6', samenwerking: '#8B5CF6',
  reflectie: '#F59E0B', actie: '#EF4444', feest: '#00C853',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // ── Derived data ────────────────────────────────────────────────────────────
  const meta    = VARIANT_META[tour.variant] ?? VARIANT_META.wijktocht
  const cfg     = (tour.aiConfig ?? {}) as Record<string, unknown>
  const location = (cfg.location as string) || ''
  const tagline  = (cfg.tagline  as string) || tour.description || ''
  const emoji    = (cfg.emoji    as string) || '📍'
  const themes   = (cfg.themes   as string[]) || []

  const isFree      = (tour.priceInCents ?? 0) === 0 && tour.pricingModel === 'flat'
  const isPerPerson = tour.pricingModel === 'per_person' && tour.pricePerPersonCents > 0

  const totalGms = cps.reduce((s, c) => s + c.gmsConnection + c.gmsMeaning + c.gmsJoy + c.gmsGrowth, 0)

  const gmsPerDim = GMS_DIMS.map((d) => ({
    ...d,
    total: cps.reduce((s, c) => s + c[d.key], 0),
  }))

  const aiAssistant = ['jeugdtocht', 'voetbalmissie'].includes(tour.variant)
    ? 'Flits (hints only, geen chat)'
    : tour.variant === 'familietocht'
    ? 'Buddy (gezinsvriendelijk)'
    : 'Scout'

  return (
    <main className="min-h-screen bg-[#F8FAFC]">

      {/* ── Hero ── */}
      <div className="bg-[#0F172A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at 80% 40%, ${meta.color} 0%, transparent 50%)` }}
        />
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 relative z-10">
          {/* Breadcrumb */}
          <Link
            href="/tochten"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#00E676] text-sm mb-7 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar tochten
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${meta.color}25`, color: meta.color, border: `1px solid ${meta.color}40` }}
                >
                  {meta.label}
                </span>
                {location && (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/10">
                    <MapPin className="w-3 h-3 text-[#00E676]" />
                    {location}
                  </span>
                )}
                {themes.slice(0, 2).map((th) => (
                  <span key={th} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-[#64748B] border border-white/10">
                    {th}
                  </span>
                ))}
              </div>

              {/* Title */}
              <div className="flex items-start gap-4">
                <span className="text-4xl shrink-0">{emoji}</span>
                <div>
                  <h1
                    className="text-3xl md:text-5xl font-black italic text-white leading-tight"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {tour.name}
                  </h1>
                  {tagline && (
                    <p className="text-[#94A3B8] text-sm mt-2 max-w-lg leading-relaxed">{tagline}</p>
                  )}
                </div>
              </div>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  { Icon: Clock,  text: formatDuration(tour.estimatedDurationMin ?? 120) },
                  { Icon: MapPin, text: `${cps.length} checkpoints` },
                  { Icon: Users,  text: `max ${tour.maxTeams} teams` },
                  { Icon: Target, text: `${totalGms} GMS max` },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                    <Icon className="w-3.5 h-3.5 text-[#00E676]" />
                    <span className="text-sm text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price card */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 text-center shrink-0 min-w-[160px]">
              {isFree ? (
                <>
                  <div
                    className="text-[#00E676] font-black text-4xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    GRATIS
                  </div>
                  <p className="text-[#64748B] text-xs mt-1">geen betaling</p>
                </>
              ) : isPerPerson ? (
                <>
                  <div
                    className="text-white font-black text-4xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    €{(tour.pricePerPersonCents / 100).toFixed(0)}
                  </div>
                  <p className="text-[#64748B] text-xs mt-1">per persoon excl. BTW</p>
                </>
              ) : (
                <>
                  <div
                    className="text-white font-black text-4xl"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    €{((tour.priceInCents ?? 0) / 100).toFixed(0)}
                  </div>
                  <p className="text-[#64748B] text-xs mt-1">vaste prijs excl. BTW</p>
                </>
              )}

              <Link
                href={`/tochten/${tour.id}/boeken`}
                className="mt-5 block w-full py-3 bg-[#00E676] text-[#0F172A] rounded-xl font-black text-sm text-center hover:bg-[#00C853] transition-colors"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Nu boeken →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── GMS Dimensions band ── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-8">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Star className="w-4 h-4 text-[#F59E0B]" />
                Geluksmomenten Score (GMS)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">Elke opdracht scoort op 4 welzijnsdimensies. Score ≥ 70 = Hoge Impact badge.</p>
            </div>
            <div className="text-right shrink-0">
              <div
                className="text-3xl font-black text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {totalGms} <span className="text-[#00E676]">pt</span>
              </div>
              <div className="text-[10px] text-[#94A3B8]">max te behalen</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gmsPerDim.map((dim) => {
              const pct = totalGms > 0 ? Math.round((dim.total / totalGms) * 100) : 0
              const DimIcon = dim.icon
              return (
                <div key={dim.key} className="rounded-xl p-4" style={{ background: dim.bg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <DimIcon className="w-3.5 h-3.5" style={{ color: dim.color }} />
                    <span className="text-xs font-bold text-[#0F172A]">{dim.label}</span>
                  </div>
                  <div
                    className="text-xl font-black mb-1.5"
                    style={{ color: dim.color, fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                  >
                    {dim.total} pt
                  </div>
                  <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: dim.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Left: content (2/3) ── */}
          <div className="md:col-span-2 space-y-10">

            {/* Checkpoints */}
            <section>
              <h2 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#00E676]" />
                De {cps.length} checkpoints
              </h2>
              <p className="text-xs text-[#94A3B8] mb-4">GPS-locaties worden vrijgegeven na boeking — teams ontdekken ze stap voor stap.</p>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] divide-y divide-[#F8FAFC] overflow-hidden">
                {cps.map((cp, i) => {
                  const totalCpGms = cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth
                  const MissionIcon = MISSION_ICONS[cp.missionType] ?? MessageSquare
                  const typeColor = CP_TYPE_COLORS[cp.type] ?? '#64748B'

                  return (
                    <div key={cp.id} className="flex gap-4 p-4">
                      {/* Number */}
                      <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-sm shrink-0">
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-[#0F172A] text-sm leading-tight">{cp.name}</h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {cp.timeLimitSeconds && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                ⏱{Math.round(cp.timeLimitSeconds / 60)}m
                              </span>
                            )}
                            {cp.bonusPhotoPoints > 0 && (
                              <span className="text-[9px] font-bold bg-[#F0FDF4] text-[#00C853] px-1.5 py-0.5 rounded-full">
                                +{cp.bonusPhotoPoints}
                              </span>
                            )}
                            <span className="text-xs font-bold text-[#00C853] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                              +{totalCpGms} pt
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ color: typeColor, backgroundColor: `${typeColor}15` }}
                          >
                            {cp.type}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-[#94A3B8] font-bold uppercase">
                            <MissionIcon className="w-3 h-3" />
                            {cp.missionType}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-[#00C853]">{cp.missionTitle}</p>

                        {/* Mini GMS breakdown */}
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {GMS_DIMS.map(({ key, label, color }) => {
                            const val = cp[key]
                            if (!val) return null
                            return (
                              <span key={key} className="flex items-center gap-0.5 text-[9px] text-[#94A3B8]">
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
                                {label} {val}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Inbegrepen */}
            <section>
              <h2 className="text-xl font-bold text-[#0F172A] mb-5">Wat is inbegrepen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'GPS-navigatie op eigen telefoon',
                  `AI ${aiAssistant}-begeleiding`,
                  'Live scorebord voor spelleider',
                  'Real-time GPS monitoring dashboard',
                  'Persoonlijk Coach Inzicht per team',
                  'PDF impactrapport (GMS)',
                  'Setup wizard — klaar in 5 min',
                  'WhatsApp join-links per team',
                  ...(['jeugdtocht', 'voetbalmissie'].includes(tour.variant)
                    ? ['Geofencing + spelleider-alarm', 'AVG-compliant — geen PII opgeslagen']
                    : []),
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: sticky booking card (1/3) ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sticky top-6 overflow-hidden">
              {/* Green top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00E676] to-[#00C853]" />

              <div className="text-center mb-5 pt-1">
                {isFree ? (
                  <>
                    <div
                      className="text-[#00E676] font-black text-4xl"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                    >
                      GRATIS
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">geen betaling nodig</p>
                  </>
                ) : isPerPerson ? (
                  <>
                    <div
                      className="text-[#0F172A] font-black text-4xl"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                    >
                      €{(tour.pricePerPersonCents / 100).toFixed(0)}
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">per deelnemer excl. BTW</p>
                  </>
                ) : (
                  <>
                    <div
                      className="text-[#0F172A] font-black text-4xl"
                      style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                    >
                      €{((tour.priceInCents ?? 0) / 100).toFixed(0)}
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">voor de hele groep excl. BTW</p>
                  </>
                )}
              </div>

              <Link
                href={`/tochten/${tour.id}/boeken`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#00E676] text-[#0F172A] rounded-xl font-bold text-sm hover:bg-[#00C853] transition-colors"
              >
                Boek deze tocht <ArrowRight className="w-4 h-4" />
              </Link>

              {!isFree && (
                <p className="text-center text-[10px] text-[#94A3B8] mt-2">
                  Couponcode? Invullen bij boeking
                </p>
              )}

              <div className="mt-5 pt-5 border-t border-[#F1F5F9] space-y-2.5">
                {[
                  'Klaar in 5 minuten',
                  'Magic link direct per e-mail',
                  'Kosteloos annuleren tot 48u',
                  'Live support op game day',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                    <span className="text-xs text-[#64748B]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety badge */}
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-[#00C853]" />
                <span className="text-sm font-semibold text-[#166534]">Veilig betalen</span>
              </div>
              <p className="text-xs text-[#15803D] leading-relaxed">
                SSL beveiligd via MultiSafepay. iDEAL, Bancontact, creditcard en factuur.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748B]">Vanaf</p>
            <p
              className="font-black text-[#0F172A] text-xl"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {isFree ? 'Gratis' : isPerPerson ? `€${(tour.pricePerPersonCents / 100).toFixed(0)} p.p.` : `€${((tour.priceInCents ?? 0) / 100).toFixed(0)}`}
            </p>
          </div>
          <Link
            href={`/tochten/${tour.id}/boeken`}
            className="bg-[#00E676] text-[#0F172A] font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 hover:bg-[#00C853] transition-colors"
          >
            Boek nu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
