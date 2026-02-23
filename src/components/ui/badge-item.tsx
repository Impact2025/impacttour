import type { LucideIcon } from 'lucide-react'

interface BadgeItemProps {
  Icon: LucideIcon
  label: string
  earned?: boolean
  className?: string
}

export function BadgeItem({ Icon, label, earned = true, className = '' }: BadgeItemProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          earned ? 'bg-[#DCFCE7]' : 'bg-[#F1F5F9]'
        }`}
      >
        <Icon
          className={`w-6 h-6 ${earned ? 'text-[#00C853]' : 'text-[#CBD5E1]'}`}
          strokeWidth={2}
        />
      </div>
      <span className={`text-[10px] font-medium text-center leading-tight ${earned ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
        {label}
      </span>
    </div>
  )
}
