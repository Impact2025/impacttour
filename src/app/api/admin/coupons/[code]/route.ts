import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { coupons, orders } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { code } = await params

  // Usage history: orders that used this coupon
  const history = await db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      amountCents: orders.amountCents,
      originalAmountCents: orders.originalAmountCents,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.couponCode, code))
    .orderBy(desc(orders.createdAt))

  return NextResponse.json({ history })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { code } = await params
  const body = await req.json().catch(() => ({}))

  if (body.action === 'deactivate') {
    // Set maxUses = usedCount to exhaust it
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1)
    if (!coupon) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    await db.update(coupons).set({ maxUses: coupon.usedCount }).where(eq(coupons.code, code))
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
}
