'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface AdminNavLinkProps {
  href: string
  label: string
  Icon: LucideIcon
}

export default function AdminNavLink({ href, label, Icon }: AdminNavLinkProps) {
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
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  )
}
