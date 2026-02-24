import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, gameSessions, tours } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { count, eq, desc, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30')
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [revenueData, sessionsData, variantData, gmsData, topToursData] = await Promise.all([
    db.execute(sql`
      SELECT to_char(date_trunc('day', paid_at), 'DD-MM') as day,
             COALESCE(sum(amount_cents), 0)::int as total
      FROM orders
      WHERE status = 'paid' AND paid_at >= ${since}
      GROUP BY date_trunc('day', paid_at)
      ORDER BY 1
    `),
    db.execute(sql`
      SELECT to_char(date_trunc('week', created_at), 'DD-MM') as week,
             count(*)::int as total
      FROM game_sessions
      WHERE created_at >= ${since}
      GROUP BY date_trunc('week', created_at)
      ORDER BY 1
    `),
    db
      .select({ variant: gameSessions.variant, count: count() })
      .from(gameSessions)
      .groupBy(gameSessions.variant),
    db.execute(sql`
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
    `),
    db
      .select({
        id: tours.id,
        name: tours.name,
        variant: tours.variant,
        count: count(orders.id),
      })
      .from(tours)
      .leftJoin(orders, eq(orders.tourId, tours.id))
      .groupBy(tours.id)
      .orderBy(desc(count(orders.id)))
      .limit(10),
  ])

  return NextResponse.json({
    revenue: revenueData.rows,
    sessions: sessionsData.rows,
    variants: variantData,
    gms: gmsData.rows,
    topTours: topToursData,
  })
}
