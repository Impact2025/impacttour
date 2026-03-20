import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm text-[#64748B]">
          <Link href="/over-ons"      className="hover:text-[#0F172A] transition-colors">Over ons</Link>
          <Link href="/impact"        className="hover:text-[#0F172A] transition-colors">Impact</Link>
          <Link href="/prijzen"       className="hover:text-[#0F172A] transition-colors">Prijzen</Link>
          <Link href="/contact"       className="hover:text-[#0F172A] transition-colors">Contact</Link>
          <Link href="/tochten"       className="hover:text-[#0F172A] transition-colors">Marketplace</Link>
          <Link href="/tocht-op-maat" className="hover:text-[#0F172A] transition-colors">Tocht op Maat</Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden md:block text-sm font-medium text-[#64748B] hover:text-[#0F172A] px-3 py-1.5 transition-colors"
          >
            Inloggen
          </Link>
          <Link
            href="/tochten"
            className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors flex items-center gap-1"
          >
            Boek een tocht
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
