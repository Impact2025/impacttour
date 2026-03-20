'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/tochten',       label: 'Tochten' },
  { href: '/impact',        label: 'Impact' },
  { href: '/prijzen',       label: 'Prijzen' },
  { href: '/over-ons',      label: 'Over ons' },
  { href: '/contact',       label: 'Contact' },
  { href: '/tocht-op-maat', label: 'Op Maat', highlight: true },
]

export function SiteNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Sluit mobile menu bij route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Blokkeer body scroll als menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-200 ${
          scrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.08)]' : 'border-b border-[#E2E8F0]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/IctusGo.png"
              alt="IctusGo"
              width={120}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(({ href, label, highlight }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
              if (highlight) {
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ml-1 ${
                      active
                        ? 'text-[#0F172A] bg-[#F0FDF4]'
                        : 'text-[#00C853] hover:bg-[#F0FDF4]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] shrink-0" />
                    {label}
                  </Link>
                )
              }
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? 'text-[#0F172A] font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#00E676] rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="hidden md:block text-sm font-medium text-[#64748B] hover:text-[#0F172A] px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-all"
            >
              Inloggen
            </Link>
            <Link
              href="/tochten"
              className="hidden md:flex items-center gap-1.5 text-sm font-bold bg-[#00E676] text-[#0F172A] px-4 py-2.5 rounded-xl hover:bg-[#00C853] active:scale-95 transition-all"
            >
              Boek een tocht
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobiel: CTA knop (compact) + hamburger */}
            <Link
              href="/tochten"
              className="md:hidden flex items-center gap-1 text-xs font-bold bg-[#00E676] text-[#0F172A] px-3 py-2 rounded-xl hover:bg-[#00C853] transition-all"
            >
              Boeken
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-all"
              aria-label="Menu openen"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-[#E2E8F0] shrink-0">
            <Image
              src="/images/IctusGo.png"
              alt="IctusGo"
              width={100}
              height={30}
              className="h-7 w-auto"
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-all"
              aria-label="Menu sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {NAV_LINKS.map(({ href, label, highlight }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all ${
                    active
                      ? 'bg-[#F0FDF4] text-[#0F172A] font-semibold'
                      : highlight
                      ? 'text-[#00C853] hover:bg-[#F0FDF4]'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {highlight && <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] shrink-0" />}
                    {label}
                  </span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />}
                </Link>
              )
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-[#E2E8F0] space-y-2 shrink-0">
            <Link
              href="/login"
              className="block w-full text-center py-2.5 text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-all"
            >
              Inloggen
            </Link>
            <Link
              href="/tochten"
              className="flex items-center justify-center gap-1.5 w-full py-3 text-sm font-bold bg-[#00E676] text-[#0F172A] rounded-xl hover:bg-[#00C853] transition-all"
            >
              Boek een tocht <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
