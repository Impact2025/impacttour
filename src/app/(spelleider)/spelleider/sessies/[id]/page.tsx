import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { gameSessions, checkpoints } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import Link from 'next/link'
import { Download, Clock, AlertTriangle } from 'lucide-react'
import { SessionControls } from './session-controls'
import { DebriefingPanel } from './debriefing-panel'
import { LiveMonitorWrapper } from './live-monitor-wrapper'

export default async function SessieDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ betaald?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const { betaald } = await searchParams

  const gameSession = await db.query.gameSessions.findFirst({
    where: and(eq(gameSessions.id, id), eq(gameSessions.spelleIderId, session.user.id)),
    with: {
      tour: true,
      teams: { orderBy: (t, { desc }) => [desc(t.totalGmsScore)] },
    },
  })

  if (!gameSession) notFound()

  // Haal eerste checkpoint op voor kaartcentrering
  const firstCheckpoint = await db
    .select({ latitude: checkpoints.latitude, longitude: checkpoints.longitude })
    .from(checkpoints)
    .where(eq(checkpoints.tourId, gameSession.tourId))
    .orderBy(asc(checkpoints.orderIndex))
    .limit(1)
    .then((rows) => rows[0] ?? null)

  const centerLat = firstCheckpoint?.latitude ?? 52.3676
  const centerLng = firstCheckpoint?.longitude ?? 4.9041

  const statusLabel: Record<string, string> = {
    draft: 'Concept',
    lobby: 'Lobby open',
    active: 'Actief',
    paused: 'Gepauzeerd',
    completed: 'Afgerond',
    cancelled: 'Geannuleerd',
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/spelleider/sessies" className="text-gray-400 hover:text-gray-600">
            ← Sessies
          </Link>
        </div>

        {betaald && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            Betaling ontvangen — je sessie is aangemaakt.
          </div>
        )}

        {/* Sessie header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {gameSession.tour?.name}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">{gameSession.tour?.variant}</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              gameSession.status === 'active' ? 'bg-green-100 text-green-700' :
              gameSession.status === 'lobby' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {statusLabel[gameSession.status]}
            </span>
          </div>

          {/* Join code */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">Teamcode</p>
            <p className="text-5xl font-black text-green-700 tracking-[0.3em]">
              {gameSession.joinCode}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Teams gaan naar impacttocht.nl/join en voeren deze code in
            </p>
          </div>

          <SessionControls
            sessionId={gameSession.id}
            currentStatus={gameSession.status}
          />
        </div>

        {/* Live monitor (actief/gepauzeerd) */}
        {(gameSession.status === 'active' || gameSession.status === 'paused') && (
          <div className="mb-4">
            <LiveMonitorWrapper
              sessionId={gameSession.id}
              centerLat={centerLat}
              centerLng={centerLng}
            />
          </div>
        )}

        {/* Afgerond: debriefing + PDF download */}
        {gameSession.status === 'completed' && (
          <div className="mb-4 space-y-4">
            <DebriefingPanel sessionId={gameSession.id} />
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Impact Rapport PDF</p>
                <p className="text-xs text-gray-400">Download het volledige sessierapport</p>
              </div>
              <a
                href={`/api/pdf/${gameSession.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-lg text-sm font-semibold hover:bg-[#00C853] transition-colors"
                download
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            </div>
          </div>
        )}

        {/* Teams scorebord */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Teams ({gameSession.teams.length})
          </h2>

          {gameSession.teams.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8]">
              <Clock className="w-6 h-6 mx-auto mb-2 text-[#CBD5E1]" />
              <p className="text-sm">
                {gameSession.status === 'lobby'
                  ? 'Wachten op teams... Teams kunnen nu deelnemen met de code hierboven.'
                  : 'Zet de sessie in de lobby om teams te laten deelnemen.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {gameSession.teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{team.name}</div>
                    <div className="text-xs text-gray-400">
                      Checkpoint {team.currentCheckpointIndex + 1}
                      {team.isOutsideGeofence && (
                        <span className="ml-2 text-red-500 inline-flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Buiten zone!</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700">{team.totalGmsScore}</div>
                    <div className="text-xs text-gray-400">
                      {team.bonusPoints > 0 ? `+${team.bonusPoints} bonus` : 'GMS'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
