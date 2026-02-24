import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const schema = z.object({
  code: z.string().min(1).max(50).transform((s) => s.toUpperCase().trim()),
  tourId: z.string().uuid(),
  originalAmountCents: z.number().int().min(0),
})

/**
 * POST /api/marketplace/coupon/validate
 * Valideert een couponcode en berekent de korting.
 * Rate limit: max 10 pogingen per IP per minuut (brute-force bescherming).
 */
export async function POST(req: Request) {
  // Rate limit: 10 validatiepogingen per IP per 60 seconden
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`coupon:${ip}`, 10, 60_000))) {
    return NextResponse.json(
      { valid: false, error: 'Te veel pogingen. Probeer het over een minuut opnieuw.' },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: 'Ongeldige invoer' }, { status: 400 })
  }

  const { code, tourId, originalAmountCents } = parsed.data

  const coupon = await db.query.coupons.findFirst({
    where: and(
      eq(coupons.code, code),
      or(isNull(coupons.tourId), eq(coupons.tourId, tourId))
    ),
  })

  if (!coupon) {
    return NextResponse.json({ valid: false, error: 'Couponcode niet gevonden' })
  }

  // Vervallen check
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Deze couponcode is verlopen' })
  }

  // Maximaal gebruik check
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: 'Deze couponcode is al volledig gebruikt' })
  }

  // Bereken korting
  let discountCents = 0
  let finalAmountCents = originalAmountCents
  let discountLabel = ''

  if (coupon.discountType === 'free') {
    discountCents = originalAmountCents
    finalAmountCents = 0
    discountLabel = '100% korting (gratis)'
  } else if (coupon.discountType === 'percent') {
    discountCents = Math.round(originalAmountCents * (coupon.discountValue / 100))
    finalAmountCents = originalAmountCents - discountCents
    discountLabel = `${coupon.discountValue}% korting`
  } else if (coupon.discountType === 'fixed') {
    discountCents = Math.min(coupon.discountValue, originalAmountCents)
    finalAmountCents = originalAmountCents - discountCents
    discountLabel = `€${(coupon.discountValue / 100).toFixed(2)} korting`
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountLabel,
    discountCents,
    finalAmountCents,
    isFree: finalAmountCents === 0,
  })
}
