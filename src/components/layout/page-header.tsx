'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  showBack?: boolean
  ActionIcon?: LucideIcon
  onAction?: () => void
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  ActionIcon,
  onAction,
  className = '',
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) onBack()
    else router.back()
  }

  return (
    <header
      className={`bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between ${className}`}
      style={{ paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))' }}
    >
      {/* Terug knop */}
      <div className="w-10">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent active:bg-[#E2E8F0] active:scale-90 transition-all duration-150"
          >
            <ChevronLeft className="w-5 h-5 text-[#64748B]" />
          </button>
        )}
      </div>

      {/* Titel */}
      <div className="text-center flex-1">
        <h1 className="text-base font-semibold text-[#0F172A] leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>

      {/* Actie icon */}
      <div className="w-10">
        {ActionIcon && (
          <button
            onClick={onAction}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent active:bg-[#E2E8F0] active:scale-90 transition-all duration-150"
          >
            <ActionIcon className="w-5 h-5 text-[#64748B]" />
          </button>
        )}
      </div>
    </header>
  )
}
