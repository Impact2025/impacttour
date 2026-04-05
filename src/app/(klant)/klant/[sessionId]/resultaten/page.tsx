import { db } from '@/lib/db'
import { gameSessions, sessionScores } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, ArrowLeft, Download, RotateCcw, Target } from 'lucide-react'
import { gmsLabel } from '@/lib/utils'
import { GMS_DIMENSIONS } from '@/lib/gms-dimensions'

export const dynamic = 'force-dynamic'

export default async function ResultatenPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { sessionId } = await params

  const gameSession = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.id, sessionId),
    with: {
      tour: { with: { checkpoints: true } },
      teams: true,
    },
  })

  if (!gameSession || gameSession.spelleIderId !== session.user.id) notFound()

  const sortedTeams = [...gameSession.teams].sort((a, b) => b.totalGmsScore - a.totalGmsScore)

  // Gemiddelde GMS over alle teams
  const avgGms = sortedTeams.length > 0
    ? Math.round(sortedTeams.reduce((s, t) => s + t.totalGmsScore, 0) / sortedTeams.length)
    : 0

  const maxGmsPossible = (gameSession.tour?.checkpoints ?? []).reduce(
    (s, cp) => s + cp.gmsConnection + cp.gmsMeaning + cp.gmsJoy + cp.gmsGrowth,
    0
  )
  const gmsPercentage = maxGmsPossible > 0 ? Math.round((avgGms / maxGmsPossible) * 100) : 0

  const impactLabel = gmsLabel(gmsPercentage)

  // Per-dimensie gemiddelden voor HR sectie
  const scores = await db.select().from(sessionScores).where(eq(sessionScores.sessionId, sessionId))
  const dimAvg = (key: 'connection' | 'meaning' | 'joy' | 'growth') =>
    scores.length > 0 ? Math.round(scores.reduce((s, r) => s + r[key], 0) / scores.length) : 0
  const dimMax = (key: 'gmsConnection' | 'gmsMeaning' | 'gmsJoy' | 'gmsGrowth') =>
    (gameSession.tour?.checkpoints ?? []).reduce((s, cp) => s + cp[key], 0)

  const hrDimensions = [
    { key: 'connection' as const, avgScore: dimAvg('connection'), maxScore: dimMax('gmsConnection') },
    { key: 'meaning'    as const, avgScore: dimAvg('meaning'),    maxScore: dimMax('gmsMeaning')    },
    { key: 'joy'        as const, avgScore: dimAvg('joy'),         maxScore: dimMax('gmsJoy')        },
    { key: 'growth'     as const, avgScore: dimAvg('growth'),     maxScore: dimMax('gmsGrowth')     },
  ].map((d) => ({ ...d, ...GMS_DIMENSIONS[d.key] }))

  const podiumHeights = ['h-32', 'h-24', 'h-20']

  return (
    <main className="min-h-screen bg-white">
      {/* Back */}
      <div className="px-6 pt-8 pb-4">
        <Link href={`/klant/${sessionId}/beheer`} className="inline-flex items-center gap-2 text-[#64748B] text-sm hover:text-[#0F172A] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      {/* Header — "Missie Voltooid" stijl zoals screen11 */}
      <div className="px-6 pb-8 text-center">
        <Trophy className="w-14 h-14 text-[#0F172A] mx-auto mb-4" />
        <h1 className="text-4xl font-black text-[#0F172A] uppercase leading-tight mb-1"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)', fontStyle: 'italic' }}>
          MISSIE VOLTOOID
        </h1>
        <p className="text-[#94A3B8] text-xs uppercase tracking-widest font-semibold">
          Performance Summary
        </p>
      </div>

      {/* Podium — top 3 */}
      {sortedTeams.length >= 2 && (
        <div className="px-6 pb-8">
          <div className="flex items-end justify-center gap-2">
            {/* #2 */}
            {sortedTeams[1] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-[#64748B] text-xs font-bold mb-1 uppercase tracking-wider">
                  {sortedTeams[1].name.length > 10 ? sortedTeams[1].name.slice(0, 10) + '…' : sortedTeams[1].name}
                </div>
                <div className="text-[#0F172A] font-black text-2xl"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                  {sortedTeams[1].totalGmsScore}
                </div>
                <div className={`w-full ${podiumHeights[1]} bg-[#F1F5F9] rounded-t-lg flex items-end justify-center pb-3`}>
                  <span className="text-[#94A3B8] font-black text-3xl italic"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>02</span>
                </div>
              </div>
            )}
            {/* #1 */}
            {sortedTeams[0] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-[#0F172A] text-xs font-bold mb-1 uppercase tracking-wider">
                  {sortedTeams[0].name.length > 10 ? sortedTeams[0].name.slice(0, 10) + '…' : sortedTeams[0].name}
                </div>
                <div className="text-[#00E676] font-black text-4xl"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                  {sortedTeams[0].totalGmsScore}
                </div>
                <div className={`w-full ${podiumHeights[0]} bg-[#0F172A] rounded-t-lg flex items-end justify-center pb-3`}
                  style={{ borderBottom: '3px solid #F59E0B' }}>
                  <span className="text-[#F59E0B] font-black text-4xl italic"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>01</span>
                </div>
              </div>
            )}
            {/* #3 */}
            {sortedTeams[2] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-[#64748B] text-xs font-bold mb-1 uppercase tracking-wider">
                  {sortedTeams[2].name.length > 10 ? sortedTeams[2].name.slice(0, 10) + '…' : sortedTeams[2].name}
                </div>
                <div className="text-[#0F172A] font-black text-2xl"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                  {sortedTeams[2].totalGmsScore}
                </div>
                <div className={`w-full ${podiumHeights[2]} bg-[#F1F5F9] rounded-t-lg flex items-end justify-center pb-3`}>
                  <span className="text-[#CD7C2F] font-black text-3xl italic"
                    style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>03</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GMS Score kaart */}
      <div className="px-6 pb-6">
        <div className="border border-[#E2E8F0] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-sm uppercase tracking-wider text-[#0F172A]"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)', fontStyle: 'italic' }}>
              Geluksmomenten Score
            </span>
            <span className="text-[#94A3B8] text-xs uppercase tracking-wider">Live Data</span>
          </div>

          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-6xl font-black text-[#0F172A]"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
              {avgGms}
            </span>
            <span className="text-[#94A3B8] text-sm font-bold uppercase">PTS</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#00E676] rounded-full transition-all"
              style={{ width: `${Math.min(gmsPercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#00E676]">⚡</span>
            <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              {impactLabel} · {gmsPercentage}% van max
            </span>
          </div>
        </div>
      </div>

      {/* HR Impact One-Pager */}
      <div className="px-6 pb-6">
        <div className="rounded-2xl overflow-hidden border border-[#E2E8F0]">

          {/* Header */}
          <div className="bg-[#0F172A] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest mb-0.5">
                Voor de boardroom
              </p>
              <h3
                className="text-white font-black text-lg uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)', fontStyle: 'italic' }}
              >
                HR Impact Dashboard
              </h3>
            </div>
            <div className="bg-[#00E676]/15 border border-[#00E676]/40 rounded-full px-3 py-1.5 text-center shrink-0">
              <span className="text-[#00E676] text-sm font-black block leading-none">{gmsPercentage}%</span>
              <span className="text-[#00E676]/60 text-[9px] font-semibold uppercase">GMS</span>
            </div>
          </div>

          {/* Dimensie rijen */}
          <div className="divide-y divide-[#F1F5F9]">
            {hrDimensions.map((dim) => {
              const pct = dim.maxScore > 0 ? Math.round((dim.avgScore / dim.maxScore) * 100) : 0
              const qualColor = pct >= 70 ? '#16a34a' : pct >= 40 ? '#D97706' : '#DC2626'
              return (
                <div key={dim.key} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-bold text-[#0F172A] text-sm">{dim.label}</span>
                      <span
                        className="text-[9px] font-black uppercase tracking-wider"
                        style={{ color: dim.color }}
                      >
                        {dim.hrLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{dim.hrOutcome}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {dim.maxScore > 0 ? (
                      <>
                        <div
                          className="text-xl font-black leading-none"
                          style={{
                            fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
                            color: dim.color,
                          }}
                        >
                          {dim.avgScore}
                        </div>
                        <div className="text-[10px] text-[#94A3B8]">/{dim.maxScore}</div>
                        <div className="text-[10px] font-bold mt-0.5" style={{ color: qualColor }}>
                          {pct >= 70 ? 'Sterk' : pct >= 40 ? 'Gemiddeld' : 'Aandacht'}
                        </div>
                      </>
                    ) : (
                      <span className="text-[#CBD5E1] text-xs">—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Boardroom statement */}
          <div className="bg-[#F0FDF4] border-t border-[#DCFCE7] px-5 py-4">
            <p className="text-sm text-[#166534] leading-relaxed font-medium">
              &ldquo;ImpactTocht helpt bij het verlagen van ziekteverzuim door verbinding en
              zingeving op de werkvloer.&rdquo;
            </p>
            <p className="text-[10px] text-[#86EFAC] mt-2 font-bold uppercase tracking-widest">
              TeambuildingMetImpact.nl
            </p>
          </div>

        </div>
      </div>

      {/* Locatie / tocht */}
      {gameSession.tour && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-[#64748B]" />
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-bold">Tocht</p>
              <p className="font-bold text-[#0F172A] uppercase text-sm tracking-wide">
                {gameSession.tour.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alle teams */}
      {sortedTeams.length > 3 && (
        <div className="px-6 pb-6">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Alle teams</h3>
          <div className="space-y-2">
            {sortedTeams.slice(3).map((team, i) => (
              <div key={team.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                <span className="text-[#94A3B8] text-sm font-bold w-6 text-center">{i + 4}</span>
                <span className="flex-1 text-[#0F172A] text-sm font-medium">{team.name}</span>
                <span className="text-[#0F172A] font-bold text-sm">{team.totalGmsScore} pt</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA knoppen — zoals screen11 */}
      <div className="px-6 pb-10 space-y-3">
        <Link
          href={`/spelleider/sessies/${sessionId}`}
          className="block w-full py-4 border-2 border-[#0F172A] rounded-xl text-center font-black text-sm uppercase tracking-wider text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)', fontStyle: 'italic' }}
        >
          Bekijk Rapport
        </Link>
        <a
          href={`/api/pdf/${sessionId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 bg-[#00E676] rounded-xl text-center font-black text-sm uppercase tracking-wider text-[#0F172A] hover:bg-[#00C853] transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)', fontStyle: 'italic' }}
        >
          <Download className="w-4 h-4" />
          Download Rapport PDF
        </a>
        <Link
          href={`/tochten/${gameSession.tourId}`}
          className="block w-full py-3 text-center text-[#94A3B8] text-sm hover:text-[#64748B] transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Dezelfde tocht opnieuw boeken
        </Link>
      </div>
    </main>
  )
}
