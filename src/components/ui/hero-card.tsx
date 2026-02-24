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
    <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-white"
      style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.25), 0 2px 8px rgba(0,0,0,0.15)' }}>
      {/* Decoratieve groene gloed */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#00E676]/08 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-[#00E676]/05 blur-2xl pointer-events-none" />

      {/* Subtiele groene lijn bovenaan */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E676]/40 to-transparent" />

      <div className="relative">
        {/* Rang pill */}
        <div className="inline-flex items-center gap-1.5 bg-[#00E676]/15 border border-[#00E676]/25 rounded-full px-3 py-1 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
          <span
            className="text-[#00E676] text-[11px] font-bold tracking-widest"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            {getRankLabel(rank)}
          </span>
        </div>

        {/* Team naam */}
        {teamName && (
          <p className="text-[#475569] text-sm mb-1 font-medium">{teamName}</p>
        )}

        {/* Score — gigantisch */}
        <div className="flex items-end gap-3">
          <span
            className="leading-none font-black text-white"
            style={{
              fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
              fontSize: '72px',
            }}
          >
            {score}
          </span>
          <div className="mb-3">
            <span
              className="text-[#64748B] text-sm font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {label}
            </span>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-bold mt-0.5 ${trendPositive ? 'text-[#00E676]' : 'text-red-400'}`}>
                {trendPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{trendPositive ? '+' : ''}{trend} bonus pt</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
