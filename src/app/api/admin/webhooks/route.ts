import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { webhookEvents } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq, desc, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const provider = searchParams.get('provider') ?? ''

  const conditions = []
  if (status) conditions.push(eq(webhookEvents.status, status))
  if (provider) conditions.push(eq(webhookEvents.provider, provider))

  const rows = await db
    .select()
    .from(webhookEvents)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(webhookEvents.createdAt))
    .limit(100)

  return NextResponse.json(rows)
}
