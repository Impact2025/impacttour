import { ChevronRight, MapPin, Clock, CheckSquare } from 'lucide-react'

interface MapStats {
  km?: number
  minuten?: number
  checkpoints?: number
  completed?: number
}

interface MapOverlayCardProps {
  location: string
  stats?: MapStats
  onDetails?: () => void
}

export function MapOverlayCard({ location, stats, onDetails }: MapOverlayCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[#00C853]" />
          </div>
          <div>
            <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Huidig checkpoint</p>
            <p className="text-sm font-semibold text-[#0F172A] leading-tight">{location}</p>
          </div>
        </div>
        {onDetails && (
          <button
            onClick={onDetails}
            className="flex items-center gap-1 text-xs font-semibold text-[#00C853] active:opacity-70"
          >
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stats row */}
      {stats && (
        <div className="flex gap-4 border-t border-[#E2E8F0] pt-3">
          {stats.km !== undefined && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-xs font-semibold text-[#0F172A]">{stats.km} km</span>
            </div>
          )}
          {stats.minuten !== undefined && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-xs font-semibold text-[#0F172A]">{stats.minuten} min</span>
            </div>
          )}
          {stats.checkpoints !== undefined && (
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-xs font-semibold text-[#0F172A]">
                {stats.completed ?? 0}/{stats.checkpoints}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
