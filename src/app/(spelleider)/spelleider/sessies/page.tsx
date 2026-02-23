import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { gameSessions, tours } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Calendar, LayoutGrid } from 'lucide-react'
const statusLabel: Record<string, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-600' },
  lobby: { label: 'Lobby open', color: 'bg-blue-100 text-blue-600' },
  active: { label: 'Actief', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Gepauzeerd', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Afgerond', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Geannuleerd', color: 'bg-red-100 text-red-500' },
}

export default async function SessiesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const mijnSessies = await db
    .select({
      session: gameSessions,
      tourName: tours.name,
      tourVariant: tours.variant,
    })
    .from(gameSessions)
    .leftJoin(tours, eq(gameSessions.tourId, tours.id))
    .where(eq(gameSessions.spelleIderId, session.user.id))
    .orderBy(desc(gameSessions.createdAt))
    .limit(50)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sessies</h1>
        </div>

        {mijnSessies.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
            <LayoutGrid className="w-8 h-8 mx-auto mb-3 text-[#CBD5E1]" />
            <p className="font-medium text-gray-600 mb-1">Nog geen sessies</p>
            <p className="text-sm mb-6">Ga naar een tocht om een sessie te starten.</p>
            <Link
              href="/spelleider/tochten"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Tochten bekijken
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mijnSessies.map(({ session: gs, tourName, tourVariant }) => {
              const status = statusLabel[gs.status] ?? statusLabel.draft
              return (
                <Link
                  key={gs.id}
                  href={`/spelleider/sessies/${gs.id}`}
                  className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{tourName ?? 'Onbekende tocht'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="font-mono text-base font-bold text-gray-500 tracking-widest">
                          {gs.joinCode}
                        </span>
                        <span>{tourVariant}</span>
                        {gs.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(gs.scheduledAt).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                        )}
                      </div>
                    </div>
                    <div className="text-gray-300 text-xl">›</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
