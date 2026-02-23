import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq, or, and, asc } from 'drizzle-orm'
import Link from 'next/link'
import { Clock, Users, MapPin, Star, Euro } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { TourActions } from './tour-actions'

export default async function TochtDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ generated?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const { generated } = await searchParams

  // Eigen tochten én gepubliceerde platform-tochten zijn zichtbaar
  const tour = await db.query.tours.findFirst({
    where: and(
      eq(tours.id, id),
      or(eq(tours.createdById, session.user.id), eq(tours.isPublished, true))
    ),
    with: {
      checkpoints: { orderBy: (c) => [asc(c.orderIndex)] },
    },
  })

  if (!tour) notFound()

  const isOwner = tour.createdById === session.user.id

  const variantLabel: Record<string, string> = {
    wijktocht: 'WijkTocht',
    impactsprint: 'ImpactSprint',
    familietocht: 'FamilieTocht',
    jeugdtocht: 'JeugdTocht',
    voetbalmissie: 'VoetbalMissie',
  }

  const checkpointTypeLabel: Record<string, string> = {
    kennismaking: '👋 Kennismaking',
    samenwerking: '🤝 Samenwerking',
    reflectie: '💭 Reflectie',
    actie: '⚡ Actie',
    feest: '🎉 Feest',
  }

  const totalGMS = tour.checkpoints.reduce(
    (sum, c) => sum + c.gmsConnection + c.gmsMeaning + c.gmsJoy + c.gmsGrowth,
    0
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <Link href="/spelleider/tochten" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Tochten
          </Link>
          {/* Bewerk/verwijder alleen voor eigenaar */}
          {isOwner && <TourActions tourId={tour.id} isPublished={tour.isPublished} />}
        </div>

        {generated && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✨ AI heeft een complete tocht gegenereerd. Bekijk en pas de checkpoints aan op de kaart.
          </div>
        )}

        {/* Platform-badge voor niet-eigen tochten */}
        {!isOwner && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm flex items-center gap-2">
            <span>📚</span>
            <span>Platform-tocht — checkpoints zijn kant-en-klaar. Start direct een sessie.</span>
          </div>
        )}

        {/* Tocht info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tour.name}</h1>
              {tour.description && (
                <p className="text-gray-500 mt-1">{tour.description}</p>
              )}
            </div>
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium shrink-0">
              {variantLabel[tour.variant] ?? tour.variant}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{formatDuration(tour.estimatedDurationMin ?? 120)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              <span>Max {tour.maxTeams} teams</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{tour.checkpoints.length} checkpoints</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-gray-400" />
              <span>{totalGMS} max GMS punten</span>
            </div>
            {(tour.priceInCents ?? 0) > 0 && (
              <div className="flex items-center gap-1.5">
                <Euro className="w-4 h-4 text-gray-400" />
                <span>€{((tour.priceInCents ?? 0) / 100).toFixed(2)} per sessie</span>
              </div>
            )}
          </div>
        </div>

        {/* Checkpoints */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Checkpoints ({tour.checkpoints.length})
            </h2>
            {/* Kaarteditor alleen voor eigenaar */}
            {isOwner && (
              <Link
                href={`/spelleider/tochten/${tour.id}/checkpoints`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                📍 Kaarteditor openen
              </Link>
            )}
          </div>

          {tour.checkpoints.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nog geen checkpoints. Open de kaarteditor om checkpoints toe te voegen.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tour.checkpoints.map((cp, idx) => {
                const maxGms = cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth
                return (
                  <div
                    key={cp.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-green-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">{cp.name}</span>
                        <span className="text-xs text-gray-400">{checkpointTypeLabel[cp.type]}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{cp.missionTitle}</p>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">{maxGms}pt</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sessie starten */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Sessie starten</h2>
          <p className="text-sm text-gray-600 mb-4">
            Maak een nieuwe spelsessie aan en deel de teamcode met de deelnemers.
            {tour.checkpoints.length === 0 && (
              <span className="text-orange-600 ml-1">
                Voeg eerst checkpoints toe via de kaarteditor.
              </span>
            )}
          </p>
          <Link
            href={`/spelleider/sessies/nieuw?tourId=${tour.id}`}
            className={`inline-flex px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              tour.checkpoints.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            🎮 Nieuwe sessie aanmaken
          </Link>
        </div>

      </div>
    </main>
  )
}
