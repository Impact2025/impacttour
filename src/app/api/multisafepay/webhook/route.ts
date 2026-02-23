import { db } from '@/lib/db'
import { orders, gameSessions, users, webhookEvents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { generateMagicLink } from '@/lib/auth/magic-link'

export const dynamic = 'force-dynamic'

/**
 * GET/POST /api/multisafepay/webhook
 * MultiSafepay stuurt een notificatie (GET met ?transactionid=...) bij statuswijziging.
 * Elke event wordt gelogd in webhook_events voor audit + deduplicatie.
 */
export async function GET(req: Request) {
  return handleWebhook(req)
}

export async function POST(req: Request) {
  return handleWebhook(req)
}

async function handleWebhook(req: Request) {
  const reqUrl = new URL(req.url)
  const appUrl = `${reqUrl.protocol}//${reqUrl.host}`
  const { searchParams } = reqUrl
  const transactionId = searchParams.get('transactionid') || searchParams.get('id')

  if (!transactionId) {
    return new Response('OK', { status: 200 })
  }

  // Dedupliceer: controleer of dit event al eerder succesvol verwerkt is
  const existingEvent = await db.query.webhookEvents.findFirst({
    where: and(
      eq(webhookEvents.provider, 'multisafepay'),
      eq(webhookEvents.eventId, transactionId),
      eq(webhookEvents.status, 'processed')
    ),
  })

  if (existingEvent) {
    // Al verwerkt — idempotent antwoord
    return new Response('OK', { status: 200 })
  }

  // Log het binnenkomende event direct (voor audit trail)
  const [logEntry] = await db
    .insert(webhookEvents)
    .values({
      provider: 'multisafepay',
      eventId: transactionId,
      status: 'pending',
    })
    .returning()

  try {
    // Verifieer betaling bij MultiSafepay
    const mspApiKey = process.env.MULTISAFEPAY_API_KEY!
    const mspBaseUrl =
      process.env.MULTISAFEPAY_TEST === 'true'
        ? 'https://testapi.multisafepay.com/v1/json'
        : 'https://api.multisafepay.com/v1/json'

    const verifyRes = await fetch(`${mspBaseUrl}/orders/${transactionId}`, {
      headers: { api_key: mspApiKey },
    })

    const verifyData = await verifyRes.json()

    if (!verifyData.success) {
      await db
        .update(webhookEvents)
        .set({ status: 'failed', errorMessage: JSON.stringify(verifyData), processedAt: new Date() })
        .where(eq(webhookEvents.id, logEntry.id))
      console.error('MSP webhook verify mislukt:', verifyData)
      return new Response('OK', { status: 200 })
    }

    // Sla raw payload op voor volledige audit trail
    await db
      .update(webhookEvents)
      .set({ rawPayload: verifyData })
      .where(eq(webhookEvents.id, logEntry.id))

    const status = verifyData.data?.status
    if (status !== 'completed') {
      // Niet-betaalde statussen (initialized, declined, etc.) loggen maar niet verwerken
      await db
        .update(webhookEvents)
        .set({ status: 'duplicate', processedAt: new Date() })
        .where(eq(webhookEvents.id, logEntry.id))
      return new Response('OK', { status: 200 })
    }

    // Zoek order op via MSP order ID
    const order = await db.query.orders.findFirst({
      where: eq(orders.mspOrderId, transactionId),
    })

    if (!order || order.status === 'paid') {
      await db
        .update(webhookEvents)
        .set({ status: 'duplicate', processedAt: new Date() })
        .where(eq(webhookEvents.id, logEntry.id))
      return new Response('OK', { status: 200 })
    }

    // Markeer order als betaald
    await db
      .update(orders)
      .set({ status: 'paid', paidAt: new Date() })
      .where(eq(orders.id, order.id))

    // Markeer sessie als betaald
    if (order.sessionId) {
      await db
        .update(gameSessions)
        .set({ paidAt: new Date() })
        .where(eq(gameSessions.id, order.sessionId))
    }

    // Stuur magic link + bevestigingsmail
    const user = await db.query.users.findFirst({ where: eq(users.id, order.userId) })

    if (user && order.sessionId) {
      const magicLink = await generateMagicLink({
        email: user.email,
        callbackPath: `/klant/${order.sessionId}/setup?betaald=1`,
        appUrl,
      })

      const tour = await db.query.tours.findFirst({ where: eq(gameSessions.tourId, order.tourId) })

      await sendBookingConfirmationEmail({
        to: user.email,
        customerName: (user.name || 'klant').split(' ')[0],
        tourName: tour?.name || 'ImpactTocht',
        setupUrl: magicLink,
        loginUrl: `${appUrl}/login`,
        isPaid: true,
        amountFormatted: `€${(order.amountCents / 100).toFixed(2)}`,
        accountEmail: user.email,
      })
    }

    // Markeer event als succesvol verwerkt
    await db
      .update(webhookEvents)
      .set({ status: 'processed', processedAt: new Date() })
      .where(eq(webhookEvents.id, logEntry.id))

    return new Response('OK', { status: 200 })
  } catch (err) {
    // Fout loggen — MSP verwacht altijd HTTP 200 terug
    await db
      .update(webhookEvents)
      .set({
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
        processedAt: new Date(),
      })
      .where(eq(webhookEvents.id, logEntry.id))
    console.error('MSP webhook verwerking mislukt:', err)
    return new Response('OK', { status: 200 })
  }
}
