import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { webhookEvents, orders } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { eventId } = await params

  const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, eventId)).limit(1)
  if (!event) return NextResponse.json({ error: 'Event niet gevonden' }, { status: 404 })

  try {
    // Mark as retrying (reset to pending for reprocessing)
    await db.update(webhookEvents).set({
      status: 'pending',
      errorMessage: null,
      processedAt: null,
    }).where(eq(webhookEvents.id, eventId))

    // For MSP: verify the order exists and update if needed
    if (event.provider === 'multisafepay' && event.rawPayload) {
      const payload = event.rawPayload as Record<string, unknown>
      const orderId = event.eventId

      // Check if order is paid in MSP response
      const mspData = (payload as { data?: { financial_status?: string; amount_refunded?: number } }).data
      if (mspData?.financial_status === 'completed') {
        await db.update(orders).set({ status: 'paid', paidAt: new Date() }).where(eq(orders.mspOrderId, orderId))
        await db.update(webhookEvents).set({ status: 'processed', processedAt: new Date() }).where(eq(webhookEvents.id, eventId))
        return NextResponse.json({ success: true, message: 'Order als betaald gemarkeerd' })
      }
    }

    return NextResponse.json({ success: true, message: 'Event herverwerkt' })
  } catch (err) {
    await db.update(webhookEvents).set({ status: 'failed', errorMessage: String(err) }).where(eq(webhookEvents.id, eventId))
    return NextResponse.json({ error: 'Herverwerking mislukt' }, { status: 500 })
  }
}
