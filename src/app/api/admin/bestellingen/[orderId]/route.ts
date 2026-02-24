import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { orderId } = await params
  const body = await req.json().catch(() => ({}))
  const { action } = body

  if (action === 'refund') {
    await db.update(orders).set({ status: 'refunded' }).where(eq(orders.id, orderId))
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
}
