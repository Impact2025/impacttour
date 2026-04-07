'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
interface AdminNavLinkProps {
  href: string
  label: string
  icon: React.ReactNode
}

export default function AdminNavLink({ href, label, icon }: AdminNavLinkProps) {
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
      {label}
    </Link>
  )
}
