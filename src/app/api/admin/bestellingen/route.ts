import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, tours, gameSessions } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const tourId = searchParams.get('tourId') ?? ''
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  const conditions = []
  if (status) conditions.push(eq(orders.status, status))
  if (tourId) conditions.push(eq(orders.tourId, tourId))
  if (from) conditions.push(gte(orders.createdAt, new Date(from)))
  if (to) conditions.push(lte(orders.createdAt, new Date(to + 'T23:59:59')))

  const rows = await db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      tourName: tours.name,
      tourVariant: tours.variant,
      amountCents: orders.amountCents,
      originalAmountCents: orders.originalAmountCents,
      couponCode: orders.couponCode,
      status: orders.status,
      source: gameSessions.source,
      paidAt: orders.paidAt,
      participantCount: orders.participantCount,
      organizationName: orders.organizationName,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(tours, eq(orders.tourId, tours.id))
    .leftJoin(gameSessions, eq(orders.sessionId, gameSessions.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200)

  // Revenue totaal
  const [{ totalRevenue }] = await db
    .select({ totalRevenue: sql<number>`COALESCE(sum(${orders.amountCents}), 0)::int` })
    .from(orders)
    .where(eq(orders.status, 'paid'))

  return NextResponse.json({ orders: rows, totalRevenue })
}
