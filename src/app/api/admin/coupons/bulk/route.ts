import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const schema = z.object({
  prefix: z.string().min(2).max(20).regex(/^[A-Z0-9_-]+$/),
  count: z.number().int().min(1).max(500),
  discountType: z.enum(['percent', 'fixed', 'free']),
  discountValue: z.number().int().min(0),
  maxUses: z.number().int().min(1).nullable(),
  expiresAt: z.string().nullable(),
  tourId: z.string().uuid().nullable(),
  description: z.string().max(200).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens', details: parsed.error.flatten() }, { status: 400 })
  }

  const { prefix, count, discountType, discountValue, maxUses, expiresAt, tourId, description } = parsed.data

  const codes = Array.from({ length: count }, () => {
    const suffix = randomBytes(3).toString('hex').toUpperCase()
    return {
      code: `${prefix}-${suffix}`,
      discountType,
      discountValue: discountType === 'free' ? 100 : discountValue,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      tourId: tourId ?? null,
      description: description ?? null,
    }
  })

  // Batch insert (ignore duplicates by generating new ones — simple approach: just insert)
  try {
    await db.insert(coupons).values(codes)
    return NextResponse.json({ success: true, count: codes.length, prefix })
  } catch {
    return NextResponse.json({ error: 'Fout bij aanmaken (mogelijk dubbele codes)' }, { status: 500 })
  }
}
