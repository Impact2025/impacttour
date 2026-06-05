import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { TourEditorClient } from './tour-editor-client'
import { variantLabel } from '@/lib/admin-constants'

export const dynamic = 'force-dynamic'

export default async function TourEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/admin/login')

  const { id } = await params

  const [tour] = await db.select().from(tours).where(eq(tours.id, id)).limit(1)
  if (!tour) notFound()

  const cps = await db
    .select()
    .from(checkpoints)
    .where(eq(checkpoints.tourId, id))
    .orderBy(asc(checkpoints.orderIndex))

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/admin/tochten"
          className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Tochten
        </Link>
        <span className="text-[#CBD5E1]">/</span>
        <h1 className="text-lg font-bold text-[#0F172A] truncate">{tour.name}</h1>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
          {variantLabel(tour.variant)}
        </span>
        {tour.isPublished ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534]">Gepubliceerd</span>
        ) : (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#94A3B8]">Concept</span>
        )}
        <div className="flex-1" />
        <Link
          href={`/spelleider/tochten/${id}`}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#F1F5F9] text-[#64748B] rounded-lg hover:bg-[#E2E8F0] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Spelleider view
        </Link>
      </div>

      {/* Editor (full height) */}
      <TourEditorClient
        tour={{
          id: tour.id,
          name: tour.name,
          description: tour.description,
          variant: tour.variant,
          estimatedDurationMin: tour.estimatedDurationMin,
          maxTeams: tour.maxTeams,
          priceInCents: tour.priceInCents ?? 0,
          pricingModel: tour.pricingModel ?? 'flat',
          pricePerPersonCents: tour.pricePerPersonCents ?? 0,
          storyFrame: tour.storyFrame as { introText?: string; finaleReveal?: string } | null,
          isPublished: tour.isPublished,
        }}
        initialCheckpoints={cps.map(cp => ({
          id: cp.id,
          orderIndex: cp.orderIndex,
          name: cp.name,
          description: cp.description,
          type: cp.type,
          latitude: cp.latitude,
          longitude: cp.longitude,
          unlockRadiusMeters: cp.unlockRadiusMeters,
          missionTitle: cp.missionTitle,
          missionDescription: cp.missionDescription,
          missionType: cp.missionType,
          navigationHint: cp.navigationHint,
          gmsConnection: cp.gmsConnection,
          gmsMeaning: cp.gmsMeaning,
          gmsJoy: cp.gmsJoy,
          gmsGrowth: cp.gmsGrowth,
          hint1: cp.hint1,
          hint2: cp.hint2,
          hint3: cp.hint3,
          timeLimitSeconds: cp.timeLimitSeconds,
          bonusPhotoPoints: cp.bonusPhotoPoints,
          isKidsFriendly: cp.isKidsFriendly,
        }))}
      />
    </div>
  )
}
