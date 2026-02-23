import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, 'Alleen hoofdletters, cijfers, - en _'),
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

  const { code, discountType, discountValue, maxUses, expiresAt, tourId, description } = parsed.data

  try {
    const [coupon] = await db.insert(coupons).values({
      code,
      discountType,
      discountValue,
      maxUses,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      tourId: tourId || null,
      description: description || null,
    }).returning()

    return NextResponse.json(coupon, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json({ error: `Code "${code}" bestaat al` }, { status: 409 })
    }
    console.error('Coupon aanmaken mislukt:', err)
    return NextResponse.json({ error: 'Intern fout' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const all = await db.select().from(coupons).orderBy(coupons.createdAt)
  return NextResponse.json(all)
}
