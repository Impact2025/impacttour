interface LineDataPoint {
  label: string
  value: number
}

interface AdminLineChartProps {
  data: LineDataPoint[]
  height?: number
  color?: string
  formatValue?: (v: number) => string
}

export function AdminLineChart({
  data,
  height = 160,
  color = '#3B82F6',
  formatValue = String,
}: AdminLineChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-[#94A3B8] text-sm" style={{ height }}>
        Geen data
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.value), 1)
  const padLeft = 32
  const padBottom = 24
  const width = 480
  const chartHeight = height - padBottom

  const points = data.map((d, i) => ({
    x: padLeft + (i / Math.max(data.length - 1, 1)) * (width - padLeft),
    y: 10 + chartHeight - (d.value / max) * chartHeight,
    ...d,
  }))

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPoints = [
    `${points[0].x},${10 + chartHeight}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${10 + chartHeight}`,
  ].join(' ')

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height + 10}`}
        className="w-full"
        style={{ minWidth: '280px' }}
      >
        {/* Y-axis gridlines */}
        {[0, 0.5, 1].map(pct => {
          const y = 10 + chartHeight - pct * chartHeight
          return (
            <g key={pct}>
              <text x={padLeft - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94A3B8">
                {formatValue(Math.round(pct * max))}
              </text>
              <line x1={padLeft} y1={y} x2={width} y2={y} stroke="#F1F5F9" strokeWidth={1} />
            </g>
          )
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill={color} fillOpacity={0.1} />

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}

        {/* X labels */}
        {points.map((p, i) => {
          const showLabel = data.length <= 8 || i % Math.ceil(data.length / 6) === 0
          return showLabel ? (
            <text
              key={i}
              x={p.x}
              y={height + 8}
              textAnchor="middle"
              fontSize={8}
              fill="#94A3B8"
            >
              {p.label}
            </text>
          ) : null
        })}
      </svg>
    </div>
  )
}
