interface BarData {
  day: string
  value: number
  isCurrent?: boolean
}

interface MiniBarChartProps {
  data: BarData[]
  className?: string
}

export function MiniBarChart({ data, className = '' }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={`flex items-end gap-1.5 ${className}`}>
      {data.map((item, i) => {
        const heightPct = (item.value / max) * 100
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex items-end" style={{ height: '64px' }}>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  item.isCurrent ? 'bg-[#00E676]' : 'bg-[#E2E8F0]'
                }`}
                style={{ height: `${Math.max(8, heightPct)}%` }}
              />
            </div>
            <span className={`text-[9px] font-medium ${item.isCurrent ? 'text-[#00E676]' : 'text-[#94A3B8]'}`}>
              {item.day}
            </span>
          </div>
        )
      })}
    </div>
  )
}
