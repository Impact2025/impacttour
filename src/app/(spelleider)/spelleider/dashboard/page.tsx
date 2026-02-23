import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { tours, gameSessions } from '@/lib/db/schema'
import { eq, and, inArray, count } from 'drizzle-orm'
import Link from 'next/link'
import { Navigation, Calendar, BarChart2, Map, Layers, Sparkles, LogOut, ClipboardList } from 'lucide-react'

export default async function SpelleiderDashboard() {
  const session = await auth()
  if (!session) redirect('/login')

  const [tourCount] = await db
    .select({ count: count() })
    .from(tours)
    .where(eq(tours.createdById, session.user.id))

  const activeSessions = await db
    .select({ count: count() })
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.spelleIderId, session.user.id),
        inArray(gameSessions.status, ['lobby', 'active'])
      )
    )

  const recentSessions = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.spelleIderId, session.user.id))
    .orderBy(gameSessions.createdAt)
    .limit(5)

  const stats = [
    { label: 'Mijn tochten', value: tourCount.count.toString(), Icon: Map, href: '/spelleider/tochten' },
    { label: 'Actieve sessies', value: activeSessions[0].count.toString(), Icon: Calendar, href: '/spelleider/sessies' },
    { label: 'Gem. GMS score', value: '—', Icon: BarChart2, href: '#' },
  ]

  const actions = [
    { label: 'Tochten', href: '/spelleider/tochten', Icon: Layers },
    { label: 'Sessies', href: '/spelleider/sessies', Icon: Calendar },
    { label: 'AI Generator', href: '/spelleider/tochten/nieuw?ai=1', Icon: Sparkles },
    { label: 'Uitloggen', href: '/api/auth/signout', Icon: LogOut },
  ]

  const statusLabel: Record<string, string> = {
    draft: 'Concept',
    lobby: 'Lobby',
    active: 'Actief',
    paused: 'Gepauzeerd',
    completed: 'Afgerond',
    cancelled: 'Geannuleerd',
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00E676] flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#0F172A]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Dashboard</h1>
              <p className="text-[#94A3B8] text-xs">{session.user.name || session.user.email}</p>
            </div>
          </div>
          <Link
            href="/spelleider/tochten/nieuw"
            className="px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-lg font-semibold text-sm hover:bg-[#00C853] transition-colors"
          >
            + Nieuwe tocht
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] flex items-center justify-center mb-3">
                <stat.Icon className="w-4.5 h-4.5 text-[#64748B]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A]">{stat.value}</div>
              <div className="text-sm text-[#94A3B8] mt-0.5">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Snelle acties */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2.5 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-[#0F172A]"
            >
              <action.Icon className="w-4 h-4 text-[#64748B] shrink-0" />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recente sessies */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0F172A]">Recente sessies</h2>
            <Link href="/spelleider/sessies" className="text-sm text-[#00C853] hover:underline">
              Alle sessies →
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-10">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-[#CBD5E1]" />
                </div>
              </div>
              <p className="text-sm text-[#64748B] font-medium">Nog geen sessies</p>
              <p className="text-xs text-[#94A3B8] mt-1 mb-4">Start je eerste tocht!</p>
              <Link
                href="/spelleider/tochten/nieuw"
                className="inline-block px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-lg text-sm font-semibold hover:bg-[#00C853]"
              >
                Tocht aanmaken
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((gs) => (
                <Link
                  key={gs.id}
                  href={`/spelleider/sessies/${gs.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#F1F5F9] hover:border-[#00E676]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#64748B] tracking-widest text-sm">
                      {gs.joinCode}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      gs.status === 'active' ? 'bg-[#DCFCE7] text-[#00C853]' :
                      gs.status === 'lobby' ? 'bg-blue-50 text-blue-600' :
                      'bg-[#F1F5F9] text-[#94A3B8]'
                    }`}>
                      {statusLabel[gs.status]}
                    </span>
                  </div>
                  <span className="text-xs text-[#CBD5E1]">
                    {new Date(gs.createdAt).toLocaleDateString('nl-NL')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
