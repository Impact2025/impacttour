interface AvatarRingProps {
  src?: string
  name: string
  level?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: { outer: 'w-10 h-10', inner: 'w-9 h-9', text: 'text-sm', badge: 'text-[9px] px-1.5 py-0.5' },
  md: { outer: 'w-14 h-14', inner: 'w-12 h-12', text: 'text-base', badge: 'text-[10px] px-2 py-0.5' },
  lg: { outer: 'w-20 h-20', inner: 'w-18 h-18', text: 'text-xl', badge: 'text-xs px-2 py-0.5' },
  xl: { outer: 'w-28 h-28', inner: 'w-24 h-24', text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
}

export function AvatarRing({ src, name, level, size = 'md', className = '' }: AvatarRingProps) {
  const s = sizeMap[size]
  const initials = name
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Groene ring wrapper */}
      <div className={`${s.outer} rounded-full p-[3px] bg-[#00E676] shadow-md`}>
        <div className={`${s.inner} rounded-full bg-[#DCFCE7] flex items-center justify-center overflow-hidden`}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className={`${s.text} font-bold text-[#00C853]`}>{initials}</span>
          )}
        </div>
      </div>

      {/* Level badge */}
      {level !== undefined && (
        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00E676] text-[#0F172A] font-bold rounded-full ${s.badge} whitespace-nowrap`}>
          Lvl {level}
        </div>
      )}
    </div>
  )
}
