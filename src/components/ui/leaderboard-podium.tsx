interface PodiumTeam {
  name: string
  score: number
  rank: 1 | 2 | 3
}

interface LeaderboardPodiumProps {
  teams: PodiumTeam[]
}

const rankConfig = {
  1: {
    barBg: 'bg-[#1E293B]',
    scoreColor: '#F59E0B',
    numColor: '#F59E0B',
    numLabel: '01',
    height: 'h-28',
  },
  2: {
    barBg: 'bg-[#334155]',
    scoreColor: '#0F172A',
    numColor: '#94A3B8',
    numLabel: '02',
    height: 'h-20',
  },
  3: {
    barBg: 'bg-[#475569]',
    scoreColor: '#0F172A',
    numColor: '#94A3B8',
    numLabel: '03',
    height: 'h-14',
  },
}

function PodiumColumn({ team }: { team: PodiumTeam }) {
  const cfg = rankConfig[team.rank]
  return (
    <div className="flex flex-col items-center flex-1">
      {/* Score + naam boven de balk */}
      <div className="text-center mb-2 px-1">
        <p
          className="leading-none font-black truncate max-w-[90px]"
          style={{
            fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
            fontSize: team.rank === 1 ? '22px' : '18px',
            color: cfg.scoreColor,
          }}
        >
          {team.score}
        </p>
        <p className="text-[11px] text-[#64748B] truncate max-w-[90px] mt-0.5 font-medium">
          {team.name}
        </p>
      </div>

      {/* Podium balk */}
      <div
        className={`w-full ${cfg.height} ${cfg.barBg} rounded-t-xl flex items-end justify-center pb-2`}
      >
        <span
          className="text-base font-black italic"
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
    <div className="flex items-end gap-2">
      {rank2 && <PodiumColumn team={rank2} />}
      {rank1 && <PodiumColumn team={rank1} />}
      {rank3 && <PodiumColumn team={rank3} />}
    </div>
  )
}
