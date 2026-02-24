import { db } from '@/lib/db'
import { gameSessions, orders, tours } from '@/lib/db/schema'
import { count, eq, desc, sql } from 'drizzle-orm'
import { AdminSparkChart } from '@/components/admin/admin-spark-chart'
import { AdminLineChart } from '@/components/admin/admin-line-chart'
import { AdminDonutChart } from '@/components/admin/admin-donut-chart'
import { AnalyticsDateRangeSelector } from './analytics-client'

export const dynamic = 'force-dynamic'

const VARIANT_LABELS: Record<string, string> = {
  wijktocht: 'WijkTocht',
  impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht',
  jeugdtocht: 'JeugdTocht',
  voetbalmissie: 'VoetbalMissie',
}

const VARIANT_COLORS: Record<string, string> = {
  wijktocht: '#00E676',
  impactsprint: '#3B82F6',
  familietocht: '#F59E0B',
  jeugdtocht: '#8B5CF6',
  voetbalmissie: '#EF4444',
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const days = parseInt(params.days ?? '30')

  const since = new Date()
  since.setDate(since.getDate() - days)

  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

  // Revenue per dag
  const revenuePerDay = await db.execute(sql`
    SELECT to_char(date_trunc('day', paid_at), 'DD-MM') as day,
           COALESCE(sum(amount_cents), 0)::int as total
    FROM orders
    WHERE status = 'paid' AND paid_at >= ${since}
    GROUP BY date_trunc('day', paid_at)
    ORDER BY 1
  `)

  // Sessies per week (8 weken)
  const sessiesPerWeek = await db.execute(sql`
    SELECT to_char(date_trunc('week', created_at), 'DD-MM') as week,
           count(*)::int as total
    FROM game_sessions
    WHERE created_at >= ${eightWeeksAgo}
    GROUP BY date_trunc('week', created_at)
    ORDER BY 1
  `)

  // Variant verdeling
  const variantVerdeling = await db
    .select({ variant: gameSessions.variant, count: count() })
    .from(gameSessions)
    .groupBy(gameSessions.variant)

  // GMS buckets
  const gmsBuckets = await db.execute(sql`
    SELECT CASE
      WHEN total_gms <= 25 THEN '0-25'
      WHEN total_gms <= 50 THEN '26-50'
      WHEN total_gms <= 75 THEN '51-75'
      ELSE '76-100'
    END as bucket,
    count(*)::int as count
    FROM session_scores
    GROUP BY bucket
    ORDER BY bucket
  `)

  // Top 10 tochten
  const topTochten = await db
    .select({
      id: tours.id,
      name: tours.name,
      variant: tours.variant,
      orderCount: count(orders.id),
    })
    .from(tours)
    .leftJoin(orders, eq(orders.tourId, tours.id))
    .groupBy(tours.id)
    .orderBy(desc(count(orders.id)))
    .limit(10)

  // Format data
  const revenueData = revenuePerDay.rows.map((r) => ({
    label: String(r.day),
    value: Number(r.total),
  }))

  const sessiesData = sessiesPerWeek.rows.map((r) => ({
    label: String(r.week),
    value: Number(r.total),
  }))

  const donutData = variantVerdeling.map((v) => ({
    label: VARIANT_LABELS[v.variant ?? ''] ?? v.variant ?? 'Onbekend',
    value: v.count,
    color: VARIANT_COLORS[v.variant ?? ''] ?? '#94A3B8',
  }))

  const gmsData = gmsBuckets.rows.map((r) => ({
    label: String(r.bucket),
    value: Number(r.count),
  }))

  const maxOrders = Math.max(...topTochten.map((t) => t.orderCount), 1)

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.value, 0)
  const totalSessions = sessiesData.reduce((sum, d) => sum + d.value, 0)
  const totalGmsScored = gmsData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Prestatie-inzichten en trends</p>
        </div>
        <AnalyticsDateRangeSelector />
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#94A3B8] mb-1">Omzet afgelopen {days}d</p>
          <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
            €{Math.round(totalRevenue / 100).toLocaleString('nl-NL')}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">{revenueData.length} dagen met omzet</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#94A3B8] mb-1">Sessies afgelopen 8 weken</p>
          <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
            {totalSessions}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">{sessiesData.length} weken data</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#94A3B8] mb-1">GMS scores opgeslagen</p>
          <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
            {totalGmsScored}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">team resultaten</p>
        </div>
      </div>

      {/* Row 1: Revenue chart — full width */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Omzet per dag — afgelopen {days} dagen</h2>
          <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">
            Betaalde bestellingen
          </span>
        </div>
        <AdminSparkChart
          data={revenueData}
          height={180}
          color="#00E676"
          formatValue={(v) => `€${Math.round(v / 100)}`}
        />
      </div>

      {/* Row 2: Sessies per week + Variant verdeling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Sessies per week — afgelopen 8 weken</h2>
          <AdminLineChart
            data={sessiesData}
            height={180}
            color="#3B82F6"
          />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Verdeling tocht-varianten</h2>
          {donutData.length > 0 ? (
            <AdminDonutChart
              segments={donutData}
              size={160}
            />
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-[#94A3B8]">
              Geen sessiedata beschikbaar
            </div>
          )}
        </div>
      </div>

      {/* Row 3: GMS distributie + Top tochten */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GMS distributie */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">GMS score distributie</h2>
            <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">
              Geluksmomenten Score
            </span>
          </div>
          {gmsData.length > 0 ? (
            <AdminSparkChart
              data={gmsData}
              height={180}
              color="#8B5CF6"
              formatValue={(v) => String(Math.round(v))}
            />
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-[#94A3B8]">
              Nog geen GMS data beschikbaar
            </div>
          )}
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] flex-shrink-0" />
            <p className="text-xs text-[#64748B]">Score &gt;= 70 = Hoge Impact badge</p>
          </div>
        </div>

        {/* Top 10 tochten */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Top tochten op bestellingen</h2>
          {topTochten.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-[#94A3B8]">
              Geen tochten gevonden
            </div>
          ) : (
            <div className="space-y-3">
              {topTochten.map((tour, index) => {
                const barWidth = maxOrders > 0 ? (tour.orderCount / maxOrders) * 100 : 0
                const variantColor = VARIANT_COLORS[tour.variant ?? ''] ?? '#94A3B8'
                return (
                  <div key={tour.id} className="flex items-center gap-3">
                    {/* Rank */}
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={
                        index === 0
                          ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : index === 1
                          ? { backgroundColor: '#F1F5F9', color: '#475569' }
                          : index === 2
                          ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                          : { backgroundColor: '#F8FAFC', color: '#94A3B8' }
                      }
                    >
                      {index + 1}
                    </span>

                    {/* Name + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-[#0F172A] truncate">{tour.name}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: variantColor + '20',
                              color: variantColor,
                            }}
                          >
                            {VARIANT_LABELS[tour.variant ?? ''] ?? tour.variant}
                          </span>
                          <span className="text-xs font-semibold text-[#0F172A]">
                            {tour.orderCount}
                          </span>
                        </div>
                      </div>
                      {/* Horizontal bar */}
                      <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: variantColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
