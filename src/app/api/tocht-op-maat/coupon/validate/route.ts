import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const PRIJS_CENTS = 4900

export async function POST(req: Request) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`coupon-sp:${ip}`, 10, 60_000))) {
    return NextResponse.json(
      { valid: false, error: 'Te veel pogingen. Probeer het over een minuut opnieuw.' },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  const code: string | undefined = typeof body?.code === 'string'
    ? body.code.toUpperCase().trim()
    : undefined

  if (!code || code.length > 50) {
    return NextResponse.json({ valid: false, error: 'Ongeldige invoer' }, { status: 400 })
  }

  // Zoek globale coupons (tourId IS NULL) — self-service heeft geen vaste tourId
  const coupon = await db.query.coupons.findFirst({
    where: and(eq(coupons.code, code), isNull(coupons.tourId)),
  })

  if (!coupon) {
    return NextResponse.json({ valid: false, error: 'Couponcode niet gevonden' })
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Deze couponcode is verlopen' })
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: 'Deze couponcode is al volledig gebruikt' })
  }

  let discountCents = 0
  let discountLabel = ''

  if (coupon.discountType === 'free') {
    discountCents = PRIJS_CENTS
    discountLabel = '100% korting — gratis!'
  } else if (coupon.discountType === 'percent') {
    discountCents = Math.round(PRIJS_CENTS * (coupon.discountValue / 100))
    discountLabel = `${coupon.discountValue}% korting`
  } else if (coupon.discountType === 'fixed') {
    discountCents = Math.min(coupon.discountValue, PRIJS_CENTS)
    discountLabel = `€${(coupon.discountValue / 100).toFixed(2)} korting`
  }

  const finalAmountCents = Math.max(0, PRIJS_CENTS - discountCents)

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountLabel,
    discountCents,
    finalAmountCents,
    isFree: finalAmountCents === 0,
  })
}
