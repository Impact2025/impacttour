import { TrendingUp, TrendingDown } from 'lucide-react'

interface HeroCardProps {
  rank?: number
  score: number
  trend?: number
  label?: string
  teamName?: string
}

function getRankLabel(rank: number) {
  if (rank === 1) return '1ST PLACE OVERALL'
  if (rank === 2) return '2ND PLACE OVERALL'
  if (rank === 3) return '3RD PLACE OVERALL'
  return `${rank}TH PLACE OVERALL`
}

export function HeroCard({ rank = 1, score, trend, label = 'GMS Score', teamName }: HeroCardProps) {
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-white shadow-xl">
      {/* Decoratieve groene gloed */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#00E676]/10 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-[#00E676]/5 blur-xl" />

      <div className="relative">
        {/* Rang pill */}
        <div className="inline-flex items-center gap-1.5 bg-[#00E676]/20 border border-[#00E676]/30 rounded-full px-3 py-1 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
          <span className="text-[#00E676] text-xs font-bold tracking-widest">
            {getRankLabel(rank)}
          </span>
        </div>

        {/* Team naam */}
        {teamName && (
          <p className="text-[#64748B] text-sm mb-1">{teamName}</p>
        )}

        {/* Score */}
        <div className="flex items-end gap-3">
          <span
            className="text-[64px] leading-none font-extrabold font-display text-white"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            {score}
          </span>
          <div className="mb-2">
            <span className="text-[#64748B] text-sm">{label}</span>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${trendPositive ? 'text-[#00E676]' : 'text-red-400'}`}>
                {trendPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{trendPositive ? '+' : ''}{trend}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
