import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { tours, checkpoints } from '@/lib/db/schema'
import { eq, ne, desc, and, count } from 'drizzle-orm'
import Link from 'next/link'
import { Clock, Users, Euro, Map, MapPin, BookOpen } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

const variantLabel: Record<string, string> = {
  wijktocht: 'WijkTocht',
  impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht',
  jeugdtocht: 'JeugdTocht',
  voetbalmissie: 'VoetbalMissie',
}

const variantColor: Record<string, string> = {
  wijktocht: 'bg-green-100 text-green-700',
  impactsprint: 'bg-blue-100 text-blue-700',
  familietocht: 'bg-orange-100 text-orange-700',
  jeugdtocht: 'bg-purple-100 text-purple-700',
  voetbalmissie: 'bg-yellow-100 text-yellow-700',
}

export default async function TochtenPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Mijn eigen tochten
  const mijnTochten = await db
    .select()
    .from(tours)
    .where(eq(tours.createdById, session.user.id))
    .orderBy(desc(tours.createdAt))

  // Bibliotheek: gepubliceerde tochten van anderen (platform-tochten)
  const bibliotheekRaw = await db
    .select({
      id: tours.id,
      name: tours.name,
      description: tours.description,
      variant: tours.variant,
      estimatedDurationMin: tours.estimatedDurationMin,
      maxTeams: tours.maxTeams,
      priceInCents: tours.priceInCents,
      checkpointCount: count(checkpoints.id),
    })
    .from(tours)
    .leftJoin(checkpoints, eq(checkpoints.tourId, tours.id))
    .where(and(eq(tours.isPublished, true), ne(tours.createdById, session.user.id)))
    .groupBy(tours.id)
    .orderBy(desc(tours.createdAt))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mijn tochten</h1>
            <p className="text-gray-500 text-sm mt-1">
              {mijnTochten.length} tocht{mijnTochten.length !== 1 ? 'en' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/spelleider/tochten/nieuw?ai=1"
              className="px-4 py-2 border border-green-600 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors text-sm"
            >
              AI generator
            </Link>
            <Link
              href="/spelleider/tochten/nieuw"
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              + Nieuwe tocht
            </Link>
          </div>
        </div>

        {/* ── Mijn tochten ── */}
        {mijnTochten.length === 0 ? (
          <div className="bg-white rounded-xl p-10 shadow-sm text-center mb-8">
            <Map className="w-8 h-8 mx-auto mb-3 text-[#CBD5E1]" />
            <p className="font-medium text-[#64748B] mb-1">Nog geen eigen tochten</p>
            <p className="text-sm text-gray-400 mb-6">
              Kies een kant-en-klare tocht uit de bibliotheek hieronder, of maak er zelf een aan.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/spelleider/tochten/nieuw?ai=1"
                className="px-4 py-2 border border-green-600 text-green-700 rounded-lg text-sm hover:bg-green-50"
              >
                AI tocht genereren
              </Link>
              <Link
                href="/spelleider/tochten/nieuw"
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                Zelf aanmaken
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {mijnTochten.map((tour) => (
              <Link
                key={tour.id}
                href={`/spelleider/tochten/${tour.id}`}
                className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="font-semibold text-gray-900 truncate">{tour.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${variantColor[tour.variant] ?? 'bg-gray-100 text-gray-600'}`}>
                        {variantLabel[tour.variant] ?? tour.variant}
                      </span>
                      {tour.isPublished && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 shrink-0">
                          Gepubliceerd
                        </span>
                      )}
                    </div>
                    {tour.description && (
                      <p className="text-sm text-gray-500 truncate">{tour.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(tour.estimatedDurationMin ?? 120)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />max {tour.maxTeams} teams</span>
                      {(tour.priceInCents ?? 0) > 0 && (
                        <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{((tour.priceInCents ?? 0) / 100).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-300 text-xl">›</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Tochtenbibliotheek ── */}
        {bibliotheekRaw.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-[#00E676]" />
              <h2 className="text-lg font-bold text-gray-900">Tochtenbibliotheek</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Kant-en-klare tochten met GPS-checkpoints. Klik op een tocht om de checkpoints te zien en direct een sessie te starten.
            </p>
            <div className="space-y-3">
              {bibliotheekRaw.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/spelleider/tochten/${tour.id}`}
                  className="block bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#00E676] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{tour.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${variantColor[tour.variant] ?? 'bg-gray-100 text-gray-600'}`}>
                          {variantLabel[tour.variant] ?? tour.variant}
                        </span>
                      </div>
                      {tour.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{tour.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(tour.estimatedDurationMin ?? 120)}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />max {tour.maxTeams} teams</span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <MapPin className="w-3 h-3" />
                          {tour.checkpointCount} checkpoints
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-300 text-xl shrink-0">›</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
