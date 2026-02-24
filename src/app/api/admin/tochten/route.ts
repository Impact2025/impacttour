import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, users, gameSessions } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { count, eq, desc, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const variant = searchParams.get('variant') ?? ''
  const published = searchParams.get('published') ?? ''

  const conditions = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (variant) conditions.push(eq(tours.variant, variant as any))
  if (published === 'true') conditions.push(eq(tours.isPublished, true))
  if (published === 'false') conditions.push(eq(tours.isPublished, false))

  const rows = await db
    .select({
      id: tours.id,
      name: tours.name,
      variant: tours.variant,
      isPublished: tours.isPublished,
      priceInCents: tours.priceInCents,
      pricingModel: tours.pricingModel,
      creatorEmail: users.email,
      sessionCount: count(gameSessions.id),
      createdAt: tours.createdAt,
    })
    .from(tours)
    .leftJoin(users, eq(tours.createdById, users.id))
    .leftJoin(gameSessions, eq(gameSessions.tourId, tours.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(tours.id, users.email)
    .orderBy(desc(tours.createdAt))

  return NextResponse.json(rows)
}
