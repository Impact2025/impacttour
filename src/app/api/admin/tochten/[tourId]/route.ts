import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours, gameSessions } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq, count, and, inArray } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { tourId } = await params
  const body = await req.json().catch(() => ({}))

  if (body.action === 'toggle_publish') {
    const [tour] = await db.select({ isPublished: tours.isPublished }).from(tours).where(eq(tours.id, tourId)).limit(1)
    if (!tour) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    await db.update(tours).set({ isPublished: !tour.isPublished, updatedAt: new Date() }).where(eq(tours.id, tourId))
    return NextResponse.json({ success: true, isPublished: !tour.isPublished })
  }

  if (body.action === 'delete') {
    // Check for active sessions
    const [{ activeCount }] = await db
      .select({ activeCount: count() })
      .from(gameSessions)
      .where(and(eq(gameSessions.tourId, tourId), inArray(gameSessions.status, ['lobby', 'active', 'paused'])))

    if (activeCount > 0) {
      return NextResponse.json({ error: `Er zijn ${activeCount} actieve sessies` }, { status: 409 })
    }

    await db.delete(tours).where(eq(tours.id, tourId))
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
}
