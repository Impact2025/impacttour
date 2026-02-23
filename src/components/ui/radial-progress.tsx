interface RadialProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}

export function RadialProgress({
  value,
  max = 100,
  size = 160,
  strokeWidth = 12,
  label,
  sublabel,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(1, Math.max(0, value / max))
  const strokeDashoffset = circumference - pct * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#00E676"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-extrabold text-[#0F172A] leading-none"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
        >
          {value}
        </span>
        {label && <span className="text-xs font-medium text-[#64748B] mt-1">{label}</span>}
        {sublabel && <span className="text-[10px] text-[#94A3B8]">{sublabel}</span>}
      </div>
    </div>
  )
}
