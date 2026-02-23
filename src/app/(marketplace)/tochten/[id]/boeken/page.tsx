import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import BookingWizard from './booking-wizard'

export default async function BookenPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, id), eq(tours.isPublished, true)),
  })

  if (!tour) notFound()

  return (
    <BookingWizard
      tour={{
        id: tour.id,
        name: tour.name,
        variant: tour.variant,
        estimatedDurationMin: tour.estimatedDurationMin ?? 120,
        maxTeams: tour.maxTeams ?? 20,
        priceInCents: tour.priceInCents ?? 0,
        pricingModel: tour.pricingModel,
        pricePerPersonCents: tour.pricePerPersonCents ?? 0,
      }}
    />
  )
}
