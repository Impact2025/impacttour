import Link from 'next/link'
import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center mb-3">
              <div className="bg-white rounded-lg px-2 py-1 inline-flex">
                <Image src="/images/IctusGo.png" alt="IctusGo" width={100} height={30} className="h-6 w-auto" />
              </div>
            </div>
            <p className="text-[#64748B] text-xs max-w-xs leading-relaxed">
              GPS-gestuurd teambuilding met echte sociale impact.
              Voor bedrijven, scholen en gezinnen — onderdeel van TeambuildingMetImpact.nl.
            </p>
            <div className="mt-4 space-y-1 text-xs text-[#475569]">
              <p>KVK: 12345678</p>
              <p>BTW: NL123456789B01</p>
              <p>
                <a href="mailto:info@teambuildingmetimpact.nl" className="hover:text-white transition-colors">
                  info@teambuildingmetimpact.nl
                </a>
              </p>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-12 text-xs">
            <div>
              <p className="text-white font-bold mb-3">Platform</p>
              <div className="space-y-2 text-[#64748B]">
                <Link href="/tochten" className="block hover:text-white transition-colors">Marketplace</Link>
                <Link href="/impact"  className="block hover:text-white transition-colors">GMS Score</Link>
                <Link href="/prijzen" className="block hover:text-white transition-colors">Prijzen</Link>
                <Link href="/faq"     className="block hover:text-white transition-colors">FAQ</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-bold mb-3">Bedrijf</p>
              <div className="space-y-2 text-[#64748B]">
                <Link href="/over-ons"     className="block hover:text-white transition-colors">Over ons</Link>
                <Link href="/contact"      className="block hover:text-white transition-colors">Contact</Link>
                <Link href="/organisaties" className="block hover:text-white transition-colors">Organisaties</Link>
                <a href="https://weareimpact.nl" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">WeAreImpact</a>
              </div>
            </div>
            <div>
              <p className="text-white font-bold mb-3">Varianten</p>
              <div className="space-y-2 text-[#64748B]">
                <p>WijkTocht</p>
                <p>ImpactSprint</p>
                <p>FamilieTocht</p>
                <p>JeugdTocht</p>
                <Link href="/voetbalmissie" className="block hover:text-white transition-colors">VoetbalMissie</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row md:justify-between gap-2 text-xs text-[#475569]">
          <p>© {new Date().getFullYear()} IctusGo — onderdeel van TeambuildingMetImpact.nl</p>
          <div className="flex gap-4">
            <Link href="/privacy"     className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/voorwaarden" className="hover:text-white transition-colors">Algemene Voorwaarden</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
