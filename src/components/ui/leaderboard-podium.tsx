interface PodiumTeam {
  name: string
  score: number
  rank: 1 | 2 | 3
}

interface LeaderboardPodiumProps {
  teams: PodiumTeam[]
}

const rankConfig = {
  1: { barBg: 'bg-[#1E293B]', numColor: '#F59E0B', numLabel: '01', height: 'h-24' },
  2: { barBg: 'bg-[#334155]', numColor: '#94A3B8', numLabel: '02', height: 'h-16' },
  3: { barBg: 'bg-[#475569]', numColor: '#94A3B8', numLabel: '03', height: 'h-12' },
}

function PodiumColumn({ team }: { team: PodiumTeam }) {
  const cfg = rankConfig[team.rank]
  return (
    <div className="flex flex-col items-center flex-1">
      {/* Score + naam boven de bar */}
      <div className="text-center mb-2">
        <p
          className="text-sm font-extrabold text-[#0F172A] truncate max-w-[80px]"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
        >
          {team.score} pt
        </p>
        <p className="text-xs text-[#64748B] truncate max-w-[80px]">{team.name}</p>
      </div>
      {/* Podium bar */}
      <div
        className={`w-full ${cfg.height} ${cfg.barBg} rounded-t-lg flex items-center justify-center`}
      >
        <span
          className="text-lg font-extrabold"
          style={{
            color: cfg.numColor,
            fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
          }}
        >
          {cfg.numLabel}
        </span>
      </div>
    </div>
  )
}

export function LeaderboardPodium({ teams }: LeaderboardPodiumProps) {
  const rank1 = teams.find((t) => t.rank === 1)
  const rank2 = teams.find((t) => t.rank === 2)
  const rank3 = teams.find((t) => t.rank === 3)

  return (
    <div className="flex items-end gap-2 px-2">
      {rank2 && <PodiumColumn team={rank2} />}
      {rank1 && <PodiumColumn team={rank1} />}
      {rank3 && <PodiumColumn team={rank3} />}
    </div>
  )
}
