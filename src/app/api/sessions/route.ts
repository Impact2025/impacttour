import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameSessions, tours } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

/** GET /api/sessions — Haal alle sessies op van ingelogde spelleider */
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const mijnSessies = await db
    .select({
      session: gameSessions,
      tourName: tours.name,
    })
    .from(gameSessions)
    .leftJoin(tours, eq(gameSessions.tourId, tours.id))
    .where(eq(gameSessions.spelleIderId, session.user.id))
    .orderBy(desc(gameSessions.createdAt))
    .limit(50)

  return NextResponse.json(mijnSessies)
}
