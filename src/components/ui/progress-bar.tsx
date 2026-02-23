interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  color?: string
}

export function ProgressBar({
  value,
  max = 100,
  className = '',
  showLabel = false,
  color = '#00E676',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-[#64748B]">{value}</span>
          <span className="text-xs text-[#64748B]">{max}</span>
        </div>
      )}
      <div className="h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
