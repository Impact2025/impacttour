import { TochtenClient } from './tochten-client'
import { Map } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TochtenPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00E676] rounded-xl flex items-center justify-center">
            <Map className="w-5 h-5 text-[#0F172A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Tochten</h1>
            <p className="text-sm text-[#94A3B8]">Alle tochten in het systeem</p>
          </div>
        </div>
        <Link href="/spelleider/tochten/nieuw" className="px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-xl font-bold text-sm hover:bg-[#00C853] transition-colors">
          + Nieuwe tocht
        </Link>
      </div>
      <TochtenClient />
    </div>
  )
}
