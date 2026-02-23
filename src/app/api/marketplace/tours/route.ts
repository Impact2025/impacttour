import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/marketplace/tours
 * Publieke lijst van gepubliceerde platform-tochten
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const variant = searchParams.get('variant')

  const conditions = [eq(tours.isPublished, true)]
  if (variant && variant !== 'alle') {
    const { tourVariantEnum } = await import('@/lib/db/schema')
    const validVariants = tourVariantEnum.enumValues
    if (validVariants.includes(variant as typeof validVariants[number])) {
      conditions.push(eq(tours.variant, variant as typeof validVariants[number]))
    }
  }

  const rows = await db
    .select({
      id: tours.id,
      name: tours.name,
      description: tours.description,
      variant: tours.variant,
      estimatedDurationMin: tours.estimatedDurationMin,
      maxTeams: tours.maxTeams,
      priceInCents: tours.priceInCents,
      pricingModel: tours.pricingModel,
      pricePerPersonCents: tours.pricePerPersonCents,
      aiConfig: tours.aiConfig,
      checkpointCount: count(checkpoints.id),
    })
    .from(tours)
    .leftJoin(checkpoints, eq(checkpoints.tourId, tours.id))
    .where(and(...conditions))
    .groupBy(tours.id)
    .orderBy(tours.createdAt)

  return NextResponse.json(rows)
}
