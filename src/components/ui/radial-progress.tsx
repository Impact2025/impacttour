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
  size = 220,
  strokeWidth = 14,
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
        {/* Track (achtergrond ring) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8F5E9"
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
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-black text-[#0F172A] leading-none"
          style={{
            fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
            fontSize: size >= 200 ? '64px' : '48px',
          }}
        >
          {value}
        </span>
        {label && (
          <span
            className="text-xs font-semibold text-[#94A3B8] mt-1 uppercase tracking-wide"
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-[#CBD5E1] mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
