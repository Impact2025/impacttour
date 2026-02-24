import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions, tours, users, teams, sessionScores } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { count, eq, desc, and, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const variant = searchParams.get('variant') ?? ''

  const conditions = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (status) conditions.push(eq(gameSessions.status, status as any))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (variant) conditions.push(eq(gameSessions.variant, variant as any))

  const rows = await db
    .select({
      id: gameSessions.id,
      name: sql<string>`COALESCE(${gameSessions.customSessionName}, ${gameSessions.organizationName}, 'Sessie')`,
      tourName: tours.name,
      variant: gameSessions.variant,
      status: gameSessions.status,
      source: gameSessions.source,
      joinCode: gameSessions.joinCode,
      spelleiderEmail: users.email,
      teamCount: count(teams.id),
      avgGms: sql<number>`ROUND(AVG(${sessionScores.totalGms}))`,
      scheduledAt: gameSessions.scheduledAt,
      startedAt: gameSessions.startedAt,
      createdAt: gameSessions.createdAt,
    })
    .from(gameSessions)
    .leftJoin(tours, eq(gameSessions.tourId, tours.id))
    .leftJoin(users, eq(gameSessions.spelleIderId, users.id))
    .leftJoin(teams, eq(teams.gameSessionId, gameSessions.id))
    .leftJoin(sessionScores, eq(sessionScores.sessionId, gameSessions.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(gameSessions.id, tours.name, users.email)
    .orderBy(desc(gameSessions.createdAt))
    .limit(100)

  return NextResponse.json(rows)
}
