interface DonutSegment {
  label: string
  value: number
  color: string
}

interface AdminDonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
}

export function AdminDonutChart({ segments, size = 160, strokeWidth = 24 }: AdminDonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (!total) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-[#94A3B8] text-sm">Geen data</span>
      </div>
    )
  }

  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  let currentAngle = -Math.PI / 2

  const arcs = segments
    .filter(s => s.value > 0)
    .map(s => {
      const fraction = s.value / total
      const startAngle = currentAngle
      const endAngle = currentAngle + fraction * 2 * Math.PI
      currentAngle = endAngle

      const x1 = cx + radius * Math.cos(startAngle)
      const y1 = cy + radius * Math.sin(startAngle)
      const x2 = cx + radius * Math.cos(endAngle)
      const y2 = cy + radius * Math.sin(endAngle)
      const largeArc = fraction > 0.5 ? 1 : 0

      const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`

      return { ...s, d, fraction }
    })

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
        {/* Segments */}
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}
        {/* Center total */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#0F172A">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#94A3B8">
          TOTAAL
        </text>
      </svg>
      {/* Legend */}
      <div className="space-y-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-[#64748B]">{s.label}</span>
            <span className="text-xs font-semibold text-[#0F172A] ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
