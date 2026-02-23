interface AvatarStackItem {
  name: string
  src?: string
}

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  avatars?: AvatarStackItem[]
  className?: string
}

function AvatarStack({ avatars }: { avatars: AvatarStackItem[] }) {
  return (
    <div className="flex -space-x-2">
      {avatars.slice(0, 3).map((a, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full border-2 border-white bg-[#DCFCE7] flex items-center justify-center text-[10px] font-bold text-[#00C853] shrink-0"
        >
          {a.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.src} alt={a.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            a.name.charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {avatars.length > 3 && (
        <div className="w-7 h-7 rounded-full border-2 border-white bg-[#E2E8F0] flex items-center justify-center text-[10px] font-bold text-[#64748B]">
          +{avatars.length - 3}
        </div>
      )}
    </div>
  )
}

export function StatCard({ label, value, unit, avatars, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 card-pressable ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-[#0F172A] leading-none">{value}</span>
            {unit && <span className="text-sm text-[#64748B]">{unit}</span>}
          </div>
        </div>
        {avatars && avatars.length > 0 && (
          <div className="mt-1">
            <AvatarStack avatars={avatars} />
          </div>
        )}
      </div>
    </div>
  )
}
