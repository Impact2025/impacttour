interface DataPoint {
  label: string
  value: number
}

interface AdminSparkChartProps {
  data: DataPoint[]
  height?: number
  formatValue?: (v: number) => string
  color?: string
}

export function AdminSparkChart({
  data,
  height = 160,
  formatValue = (v) => `€${(v / 100).toFixed(0)}`,
  color = '#00E676',
}: AdminSparkChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-[#94A3B8] text-sm" style={{ height }}>
        Geen data
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.value), 1)
  const chartHeight = height - 40
  const chartWidth = 480
  const padLeft = 48
  const availableWidth = chartWidth - padLeft
  const actualBarWidth = Math.max(2, Math.floor(availableWidth / data.length) - 2)

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${height + 20}`}
        className="w-full"
        style={{ minWidth: '280px' }}
      >
        {/* Y-axis labels and gridlines */}
        {[0, 0.5, 1].map(pct => {
          const y = 10 + chartHeight - pct * chartHeight
          const val = pct * max
          return (
            <g key={pct}>
              <text x={padLeft - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94A3B8">
                {formatValue(val)}
              </text>
              <line x1={padLeft} y1={y} x2={chartWidth} y2={y} stroke="#F1F5F9" strokeWidth={1} />
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max(2, (d.value / max) * chartHeight)
          const x = padLeft + i * (availableWidth / data.length) + 1
          const y = 10 + chartHeight - barH
          const showLabel = data.length <= 14 || i % Math.ceil(data.length / 7) === 0
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={actualBarWidth}
                height={barH}
                fill={color}
                rx={2}
                opacity={0.85}
              />
              {showLabel && (
                <text
                  x={x + actualBarWidth / 2}
                  y={height + 15}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#94A3B8"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
