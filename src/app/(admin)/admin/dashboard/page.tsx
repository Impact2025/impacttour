import { db } from '@/lib/db'
import { users, gameSessions, orders, webhookEvents, teams } from '@/lib/db/schema'
import { count, eq, sum, desc, sql, inArray } from 'drizzle-orm'
import { DollarSign, Activity, Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, ShoppingCart, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { AdminKpiCard } from '@/components/admin/admin-kpi-card'
import { AdminStatusBadge } from '@/components/admin/admin-status-badge'
import { AdminSparkChart } from '@/components/admin/admin-spark-chart'

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

function formatEuro(cents: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100)
}

function formatRelativeTime(date: Date | string | null) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Zojuist'
  if (diffMin < 60) return `${diffMin}m geleden`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}u geleden`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d geleden`
}

export default async function AdminDashboard() {
  const now = new Date()
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // 1. Total revenue
  const [{ totalRevenue }] = await db
    .select({ totalRevenue: sum(orders.amountCents) })
    .from(orders)
    .where(eq(orders.status, 'paid'))

  // 2. Active sessions count
  const [{ activeSessions }] = await db
    .select({ activeSessions: count() })
    .from(gameSessions)
    .where(inArray(gameSessions.status, ['lobby', 'active']))

  // 3. Total users
  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users)

  // 4. Conversion rate
  const [{ paidCount }] = await db
    .select({ paidCount: count() })
    .from(orders)
    .where(inArray(orders.status, ['paid', 'free']))
  const [{ totalOrders }] = await db.select({ totalOrders: count() }).from(orders)

  // 5. Revenue last 14 days
  const revenue14d = await db.execute(sql`
    SELECT to_char(date_trunc('day', paid_at), 'DD-MM') as day,
           COALESCE(sum(amount_cents), 0)::int as total
    FROM orders
    WHERE status = 'paid' AND paid_at >= ${fourteenDaysAgo}
    GROUP BY date_trunc('day', paid_at)
    ORDER BY date_trunc('day', paid_at)
  `)

  // 6. Live sessions with team counts
  const liveSessions = await db
    .select({
      id: gameSessions.id,
      name: sql<string>`COALESCE(${gameSessions.customSessionName}, ${gameSessions.organizationName}, 'Sessie')`,
      status: gameSessions.status,
      variant: gameSessions.variant,
      teamCount: count(teams.id),
      startedAt: gameSessions.startedAt,
    })
    .from(gameSessions)
    .leftJoin(teams, eq(teams.gameSessionId, gameSessions.id))
    .where(inArray(gameSessions.status, ['lobby', 'active', 'paused']))
    .groupBy(gameSessions.id)
    .orderBy(desc(gameSessions.startedAt))
    .limit(10)

  // 7. Recent activity: last 8 orders + last 5 users
  const recentOrders = await db
    .select({
      id: orders.id,
      type: sql<string>`'order'`,
      label: orders.customerName,
      sub: orders.customerEmail,
      status: orders.status,
      amount: orders.amountCents,
      at: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(8)

  const recentUsers = await db
    .select({
      id: users.id,
      type: sql<string>`'user'`,
      label: users.name,
      sub: users.email,
      status: sql<string>`'signup'`,
      amount: sql<number>`0`,
      at: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5)

  // Merge and sort by date
  const activity = [...recentOrders, ...recentUsers]
    .sort((a, b) => new Date(b.at!).getTime() - new Date(a.at!).getTime())
    .slice(0, 10)

  // 8. Failed webhooks count
  const [{ failedWebhooks }] = await db
    .select({ failedWebhooks: count() })
    .from(webhookEvents)
    .where(eq(webhookEvents.status, 'failed'))

  // Format data for spark chart
  const sparkData = revenue14d.rows.map((r) => ({
    label: String(r.day),
    value: Number(r.total),
  }))

  const conversionRate = totalOrders > 0 ? Math.round((paidCount / totalOrders) * 100) : 0
  const revenueEuro = `€${Math.round((Number(totalRevenue) ?? 0) / 100).toLocaleString('nl-NL')}`

  const dateLabel = now.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5 capitalize">{dateLabel}</p>
        </div>
        {failedWebhooks > 0 && (
          <Link
            href="/admin/webhooks"
            className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            {failedWebhooks} mislukte webhook{failedWebhooks !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label="Totale omzet"
          value={revenueEuro}
          icon={DollarSign}
          accentColor="#00E676"
        />
        <AdminKpiCard
          label="Actieve sessies"
          value={activeSessions}
          icon={Activity}
          accentColor="#3B82F6"
        />
        <AdminKpiCard
          label="Gebruikers"
          value={totalUsers}
          icon={Users}
          accentColor="#8B5CF6"
        />
        <AdminKpiCard
          label="Conversie"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          accentColor="#F59E0B"
        />
      </div>

      {/* Revenue chart + Live sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Omzet — afgelopen 14 dagen</h2>
            <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">
              {sparkData.length} datapunten
            </span>
          </div>
          {sparkData.length > 0 ? (
            <AdminSparkChart
              data={sparkData}
              color="#00E676"
              height={120}
            />
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-[#94A3B8]">
              Geen omzetdata in de afgelopen 14 dagen
            </div>
          )}
        </div>

        {/* Live sessions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Live sessies</h2>
            {liveSessions.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-[#00E676]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]" />
                </span>
                {liveSessions.length} actief
              </span>
            )}
          </div>

          {liveSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#94A3B8] mb-2" />
              <p className="text-sm text-[#94A3B8]">Geen actieve sessies</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-52">
              {liveSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/spelleider/sessies/${session.id}`}
                  className={`block p-3 rounded-xl border transition-colors hover:bg-[#F8FAFC] ${
                    session.status === 'active'
                      ? 'border-l-[3px] border-l-[#00E676] border-[#E2E8F0]'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#0F172A] truncate">{session.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: (VARIANT_COLORS[session.variant ?? ''] ?? '#94A3B8') + '20',
                            color: VARIANT_COLORS[session.variant ?? ''] ?? '#94A3B8',
                          }}
                        >
                          {VARIANT_LABELS[session.variant ?? ''] ?? session.variant}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {session.teamCount} team{session.teamCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <AdminStatusBadge status={session.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Recente activiteit</h2>
          {activity.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-[#94A3B8]">
              Nog geen activiteit
            </div>
          ) : (
            <div className="space-y-0">
              {activity.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`flex items-start gap-3 py-3 ${
                    index < activity.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.type === 'order'
                        ? 'bg-[#DCFCE7]'
                        : 'bg-[#EFF6FF]'
                    }`}
                  >
                    {item.type === 'order' ? (
                      <ShoppingCart className="w-4 h-4 text-[#166534]" />
                    ) : (
                      <UserPlus className="w-4 h-4 text-[#1D4ED8]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#0F172A] truncate">
                        {item.label ?? item.sub ?? 'Onbekend'}
                      </p>
                      {item.type === 'order' && item.amount > 0 && (
                        <span className="text-sm font-semibold text-[#0F172A] flex-shrink-0">
                          {formatEuro(item.amount)}
                        </span>
                      )}
                      {item.type === 'user' && (
                        <span className="text-xs font-medium text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-full flex-shrink-0">
                          Nieuw account
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-[#94A3B8] truncate">{item.sub}</p>
                      {item.type === 'order' && (
                        <AdminStatusBadge status={item.status} />
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3 text-[#94A3B8]" />
                    <span className="text-xs text-[#94A3B8]">{formatRelativeTime(item.at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts & quick links */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Waarschuwingen</h2>
            {failedWebhooks === 0 ? (
              <div className="flex items-center gap-2.5 p-3 bg-[#F0FDF4] rounded-xl border border-[#DCFCE7]">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#166534]">Alles in orde</p>
                  <p className="text-xs text-[#4ADE80] mt-0.5">Geen problemen gevonden</p>
                </div>
              </div>
            ) : (
              <Link
                href="/admin/webhooks"
                className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    {failedWebhooks} mislukte webhook{failedWebhooks !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">Klik om te bekijken en op te lossen</p>
                </div>
              </Link>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Snelkoppelingen</h2>
            <div className="space-y-1.5">
              {[
                { label: 'Alle bestellingen', href: '/admin/bestellingen' },
                { label: 'Gebruikers beheren', href: '/admin/gebruikers' },
                { label: 'Tochten beheren', href: '/admin/tochten' },
                { label: 'Coupons aanmaken', href: '/admin/coupons' },
                { label: 'Analytics', href: '/admin/analytics' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-3 py-2 rounded-lg text-sm text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
