import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Map,
  Activity,
  ShoppingCart,
  Tag,
  Zap,
  BarChart3,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import AdminNavLink from '@/components/admin/admin-nav-link'
import AdminSidebarToggle from '@/components/admin/admin-sidebar-toggle'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/login?callbackUrl=/admin/dashboard')

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/admin/gebruikers', label: 'Gebruikers', Icon: Users },
    { href: '/admin/tochten', label: 'Tochten', Icon: Map },
    { href: '/admin/sessies', label: 'Sessies', Icon: Activity },
    { href: '/admin/bestellingen', label: 'Bestellingen', Icon: ShoppingCart },
    { href: '/admin/coupons', label: 'Coupons', Icon: Tag },
    { href: '/admin/webhooks', label: 'Webhooks', Icon: Zap },
    { href: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar overlay for mobile */}
      <div
        id="sidebar-overlay"
        className="fixed inset-0 bg-black/50 z-30 hidden md:hidden"
      />

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className="fixed left-0 top-0 h-screen w-60 bg-[#0F172A] flex flex-col z-40 -translate-x-full md:translate-x-0 transition-transform duration-200"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00E676] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-[#0F172A] font-black text-xs">IG</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">IctusGo</div>
              <div className="text-[#475569] text-xs mt-0.5">Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.Icon}
            />
          ))}

          <div className="border-t border-white/10 mt-4 pt-4">
            <Link
              href="/spelleider/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              Spelleider portaal
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center flex-shrink-0">
              <span className="text-[#94A3B8] text-xs font-bold">
                {(session.user.email ?? 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">
                {session.user.name ?? 'Admin'}
              </div>
              <div className="text-[#64748B] text-xs truncate">{session.user.email}</div>
            </div>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#64748B] hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        {/* Mobile topbar */}
        <header className="md:hidden bg-[#0F172A] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#00E676] rounded-lg flex items-center justify-center">
              <span className="text-[#0F172A] font-black text-xs">IG</span>
            </div>
            <span className="text-white font-bold text-sm">Admin</span>
          </div>
          <AdminSidebarToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
