'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface AdminNavLinkProps {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export default function AdminNavLink({ href, label, icon, badge }: AdminNavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[#00E676] text-[#0F172A]'
          : 'text-[#94A3B8] hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
            isActive ? 'bg-[#0F172A]/20 text-[#0F172A]' : 'bg-red-500 text-white'
          }`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}
