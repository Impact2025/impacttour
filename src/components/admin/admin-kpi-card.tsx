import type { LucideIcon } from 'lucide-react'

interface AdminKpiCardProps {
  label: string
  value: string | number
  delta?: number
  icon: LucideIcon
  accentColor?: string
  href?: string
}

export function AdminKpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accentColor = '#00E676',
  href,
}: AdminKpiCardProps) {
  const card = (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: accentColor + '20' }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: accentColor }} />
        </div>
        {delta !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              delta >= 0 ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-red-50 text-red-600'
            }`}
          >
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
      <div
        className="text-2xl font-bold text-[#0F172A] leading-none mb-1"
        style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
      >
        {value}
      </div>
      <div className="text-sm text-[#94A3B8]">{label}</div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {card}
      </a>
    )
  }
  return card
}
