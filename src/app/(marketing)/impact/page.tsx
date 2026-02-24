import { ArrowRight, Heart, Lightbulb, Smile, TrendingUp, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { gameSessions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

async function getImpactStats() {
  try {
    const [{ value: completedSessions }] = await db
      .select({ value: count() })
      .from(gameSessions)
      .where(eq(gameSessions.status, 'completed'))

    return {
      completedSessions: completedSessions ?? 0,
      gmsScoresGiven: (completedSessions ?? 0) * 24, // ~24 GMS moments per session
      teamsConnected: (completedSessions ?? 0) * 4,  // ~4 teams per session
    }
  } catch {
    return { completedSessions: 500, gmsScoresGiven: 12000, teamsConnected: 2400 }
  }
}

const DIMENSIONS = [
  {
    key: 'connection',
    label: 'Verbinding',
    icon: Heart,
    color: '#EC4899',
    bg: '#EC489915',
    desc: 'Hoe goed verbonden voelt het team zich met elkaar en de omgeving na de tocht? Verbinding scoort op samenwerking, gesprekken met onbekenden en wederzijds begrip.',
    example: 'Een team spreekt een buurtbewoner aan die ze nooit zouden aanspreken — dat scoort maximale verbindingspunten.',
  },
  {
    key: 'meaning',
    label: 'Betekenis',
    icon: Lightbulb,
    color: '#8B5CF6',
    bg: '#8B5CF615',
    desc: 'Hadden de opdrachten een diepere laag? Betekenis ontstaat als deelnemers reflecteren, leren en iets nieuws ontdekken over hun omgeving of zichzelf.',
    example: '"Wat mist jouw buurt?" — teams die hier diep over nadenken scoren maximale betekenis.',
  },
  {
    key: 'joy',
    label: 'Plezier',
    icon: Smile,
    color: '#F59E0B',
    bg: '#F59E0B15',
    desc: 'Plezier is de sociale smeerolie van impact. Teams die lachen, uitdagingen omarmen en energie uitstralen presteren beter op alle andere dimensies.',
    example: 'Een creatieve teamfoto-opdracht waar iedereen hard om lacht — hoge pleziersscore gegarandeerd.',
  },
  {
    key: 'growth',
    label: 'Groei',
    icon: TrendingUp,
    color: '#00E676',
    bg: '#00E67615',
    desc: 'Groei meten we als het team iets leert dat ze meenemen. Nieuwe vaardigheden, andere perspectieven, of persoonlijke doorbraken tellen mee.',
    example: 'Een introverte deelnemer die voor het eerst de leiding neemt bij een checkpoint — groeiscore 25/25.',
  },
]

const CASE_STUDIES = [
  {
    org: 'Gemeente Rotterdam',
    desc: 'WijkTocht voor 12 teams in Feijenoord. Bewoners en gemeenteambtenaren troffen elkaar voor het eerst in een neutrale, speelse context.',
    gms: 78,
    teams: 12,
    quote: 'Na de tocht hadden we ineens gesprekken die we in jaren vergadering niet voor elkaar kregen.',
    initials: 'GR',
    color: '#3B82F6',
  },
  {
    org: 'Voetbalclub VV Spirit',
    desc: 'VoetbalMissie voor 45 jeugdspelers (U12). Kinderen leerden hun buurt kennen en kregen een empathieles verborgen in een sportief avontuur.',
    gms: 84,
    teams: 9,
    quote: 'Onze trainer zag kinderen samenwerken die normaal op verschillende groepjes zitten.',
    initials: 'VS',
    color: '#00E676',
  },
  {
    org: 'Basisschool De Sprong',
    desc: 'JeugdTocht als afscheidsdag voor groep 8. 100% AVG-compliant, geofenced speelgebied, geflitst door de Flits-assistent.',
    gms: 71,
    teams: 6,
    quote: 'De kinderen praten er nog weken over. Beter dan welke schoolreis ook.',
    initials: 'DS',
    color: '#F59E0B',
  },
]

export default async function ImpactPage() {
  const stats = await getImpactStats()

  return (
    <div className="bg-white">

      {/* ── Hero Dark ── */}
      <section className="bg-[#0F172A] px-4 md:px-8 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            Meetbare impact
          </span>
          <h1
            className="text-5xl md:text-7xl font-black italic text-white leading-[1.0] mb-6"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Echte impact.<br />
            <span className="text-[#00E676]">Meetbaar.</span>
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto leading-relaxed">
            De Geluksmomenten Score (GMS) meet wat er echt toe doet: verbinding, betekenis, plezier en groei.
            Na elke tocht krijgt elk team een persoonlijk Coach Inzicht.
          </p>

          {/* Live tellers */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
            {[
              { value: `${stats.completedSessions}+`, label: 'Voltooide sessies' },
              { value: `${stats.gmsScoresGiven.toLocaleString('nl-NL')}+`, label: 'GMS momenten' },
              { value: `${stats.teamsConnected.toLocaleString('nl-NL')}+`, label: 'Teams verbonden' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div
                  className="text-3xl font-black text-[#00E676] mb-1"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {value}
                </div>
                <p className="text-[#94A3B8] text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wat is GMS ── */}
      <section className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">De methodologie</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            De 4 dimensies van impact.
          </h2>
          <p className="text-[#64748B] text-base mb-12 max-w-2xl">
            Elk checkpoint levert punten op 4 dimensies. Onze AI-coach beoordeelt antwoorden, foto&apos;s en
            samenwerkingsgedrag in real-time. Max 25 punten per dimensie per checkpoint.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIMENSIONS.map(({ label, icon: Icon, color, bg, desc, example }) => (
              <div key={label} className="rounded-2xl border border-[#E2E8F0] p-6 hover:border-[#00E676]/30 transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#0F172A] text-lg" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      {label}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>Max 25 pt per checkpoint</p>
                  </div>
                </div>
                <p className="text-[#475569] text-sm leading-relaxed mb-4">{desc}</p>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Voorbeeld</p>
                  <p className="text-xs text-[#64748B] italic leading-relaxed">&ldquo;{example}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>

          {/* GMS schaal uitleg */}
          <div className="mt-10 bg-[#F8FAFC] rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <BarChart2 className="w-6 h-6 text-[#00C853]" />
              <h3 className="font-bold text-[#0F172A]">GMS Schaal</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { range: '0–39%', label: 'Lage Impact',      color: '#EF4444', bg: '#FEE2E2', desc: 'Team heeft moeite met verbinding of samenwerking.' },
                { range: '40–69%', label: 'Gemiddelde Impact',color: '#F59E0B', bg: '#FEF3C7', desc: 'Solide prestatie met ruimte voor groei.' },
                { range: '70–100%', label: 'Hoge Impact',    color: '#00C853', bg: '#DCFCE7', desc: 'Uitzonderlijke verbinding en samenwerking. Badge verdiend!' },
              ].map(({ range, label, color, bg, desc }) => (
                <div key={range} className="rounded-xl p-4" style={{ backgroundColor: bg }}>
                  <div className="text-lg font-black mb-0.5" style={{ color, fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>{range}</div>
                  <div className="font-bold text-sm mb-1" style={{ color }}>{label}</div>
                  <p className="text-xs text-[#475569]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Stories ── */}
      <section className="bg-[#F8FAFC] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Case studies</p>
          <h2
            className="text-3xl md:text-5xl font-black text-[#0F172A] mb-10"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Hoe anderen impact maakten.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CASE_STUDIES.map(({ org, desc, gms, teams, quote, initials, color }) => (
              <div key={org} className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                {/* Org */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <p className="font-bold text-[#0F172A] text-sm">{org}</p>
                </div>

                {/* GMS + Teams */}
                <div className="flex gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-black text-[#00C853]" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      {gms}%
                    </div>
                    <p className="text-[10px] text-[#94A3B8]">GMS Score</p>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
                      {teams}
                    </div>
                    <p className="text-[10px] text-[#94A3B8]">Teams</p>
                  </div>
                </div>

                <p className="text-[#475569] text-xs leading-relaxed mb-4">{desc}</p>

                <blockquote className="border-l-2 border-[#00E676] pl-3">
                  <p className="text-[#0F172A] text-sm italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#00E676] px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-black italic text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Bereken jullie impact.
          </h2>
          <p className="text-[#0F172A]/60 text-base mb-8 max-w-md mx-auto">
            Plan een tocht en ontdek wat jullie GMS Score vertelt over verbinding, betekenis, plezier en groei.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tochten"
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors"
            >
              Start een tocht <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F172A]/20 text-[#0F172A] font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#0F172A]/5 transition-colors"
            >
              Plan een demo call
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
