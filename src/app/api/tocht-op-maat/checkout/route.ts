import { db } from '@/lib/db'
import { users, orders, tochtAanvragen, coupons } from '@/lib/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { hashPassword, generatePassword } from '@/lib/auth/password'
import { buildSpeelbareTocht } from '@/lib/tocht-builder'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const PRIJS_CENTS = 4900 // €49,00

const schema = z.object({
  aanvraagId: z.string().uuid(),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email(),
  couponCode: z.string().max(50).optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { aanvraagId, firstName, lastName, email, couponCode } = parsed.data
  const fullName = `${firstName} ${lastName}`

  const reqUrl = new URL(req.url)
  const appUrl = `${reqUrl.protocol}//${reqUrl.host}`

  // Aanvraag ophalen
  const aanvraag = await db.query.tochtAanvragen.findFirst({
    where: eq(tochtAanvragen.id, aanvraagId),
  })
  if (!aanvraag) {
    return NextResponse.json({ error: 'Aanvraag niet gevonden' }, { status: 404 })
  }

  // Coupon valideren (indien opgegeven)
  let discountCents = 0
  let validatedCouponCode: string | null = null

  if (couponCode) {
    const code = couponCode.toUpperCase().trim()
    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code),
        or(isNull(coupons.tourId), isNull(coupons.tourId)) // self-service: altijd globale coupons
      ),
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Couponcode niet gevonden' }, { status: 400 })
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Deze couponcode is verlopen' }, { status: 400 })
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Deze couponcode is al volledig gebruikt' }, { status: 400 })
    }

    if (coupon.discountType === 'free') {
      discountCents = PRIJS_CENTS
    } else if (coupon.discountType === 'percent') {
      discountCents = Math.round(PRIJS_CENTS * (coupon.discountValue / 100))
    } else if (coupon.discountType === 'fixed') {
      discountCents = Math.min(coupon.discountValue, PRIJS_CENTS)
    }

    validatedCouponCode = code

    // usedCount verhogen
    await db
      .update(coupons)
      .set({ usedCount: coupon.usedCount + 1 })
      .where(eq(coupons.code, code))
  }

  const finalAmountCents = Math.max(0, PRIJS_CENTS - discountCents)

  // Gebruiker aanmaken of vinden
  let user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user) {
    const plainPassword = generatePassword()
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: fullName,
        role: 'spelleider',
        password: hashPassword(plainPassword),
      })
      .returning()
    user = newUser
  } else if (!user.name) {
    await db.update(users).set({ name: fullName }).where(eq(users.id, user.id))
  }

  // Order aanmaken
  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      tourId: null,
      tochtAanvraagId: aanvraagId,
      couponCode: validatedCouponCode,
      amountCents: finalAmountCents,
      originalAmountCents: PRIJS_CENTS,
      participantCount: aanvraag.deelnemers,
      status: finalAmountCents === 0 ? 'free' : 'pending',
      customerName: fullName,
      customerEmail: email,
    })
    .returning()

  // Aanvraag bijwerken
  await db
    .update(tochtAanvragen)
    .set({
      customerEmail: email,
      customerName: fullName,
      orderId: order.id,
      status: finalAmountCents === 0 ? 'building' : 'pending_payment',
    })
    .where(eq(tochtAanvragen.id, aanvraagId))

  // ── Gratis flow: tocht direct bouwen ──────────────────────────────────────
  if (finalAmountCents === 0) {
    try {
      await buildSpeelbareTocht(
        { id: order.id, userId: user.id, amountCents: 0, tochtAanvraagId: aanvraagId },
        appUrl
      )
    } catch (err) {
      console.error('[tocht-checkout] Gratis build mislukt:', err)
      // Niet fataal — bevestigingspagina pikt de 'building' status op
    }
    return NextResponse.json({
      success: true,
      free: true,
      orderId: order.id,
      redirectUrl: `/tocht-op-maat/bevestiging?orderId=${order.id}`,
    })
  }

  // ── Betaalde flow: MultiSafepay order aanmaken ────────────────────────────
  const mspApiKey = process.env.MULTISAFEPAY_API_KEY
  if (!mspApiKey) {
    return NextResponse.json({ error: 'Betalingsprovider niet geconfigureerd' }, { status: 503 })
  }

  const mspBaseUrl =
    process.env.MULTISAFEPAY_TEST === 'true'
      ? 'https://testapi.multisafepay.com/v1/json'
      : 'https://api.multisafepay.com/v1/json'

  const mspOrderId = `IT-SPEEL-${order.id.replace(/-/g, '').slice(0, 12).toUpperCase()}`
  const tocht = aanvraag.gegenereerdeJson as { title?: string } | null
  const tochtNaam = tocht?.title ?? `Tocht in ${aanvraag.stad}`

  const mspPayload = {
    type: 'redirect',
    order_id: mspOrderId,
    gateway: '',
    currency: 'EUR',
    amount: finalAmountCents,
    description: `IctusGo Speelbare Tocht — ${tochtNaam}`,
    payment_options: {
      notification_url: `${appUrl}/api/multisafepay/webhook`,
      redirect_url: `${appUrl}/tocht-op-maat/bevestiging?orderId=${order.id}`,
      cancel_url: `${appUrl}/tocht-op-maat?geannuleerd=1`,
    },
    customer: {
      email,
      first_name: firstName,
      last_name: lastName,
      locale: 'nl_NL',
    },
    order_data: {
      items: [
        {
          name: 'Speelbare Tocht (zelfservice)',
          description: `${tochtNaam} · ${aanvraag.duurMinuten} min · ${aanvraag.stad}`,
          unit_price: finalAmountCents,
          quantity: 1,
        },
      ],
    },
  }

  const mspRes = await fetch(`${mspBaseUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', api_key: mspApiKey },
    body: JSON.stringify(mspPayload),
  })
  const mspData = await mspRes.json()

  if (!mspData.success) {
    console.error('[tocht-checkout] MSP fout:', mspData)
    return NextResponse.json({ error: 'Betalingsprovider fout. Probeer opnieuw.' }, { status: 502 })
  }

  await db.update(orders).set({ mspOrderId }).where(eq(orders.id, order.id))

  return NextResponse.json({
    success: true,
    free: false,
    paymentUrl: mspData.data.payment_url,
    orderId: order.id,
  })
}
