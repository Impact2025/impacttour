import { GebruikersClient } from './gebruikers-client'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function GebruikersPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#00E676] rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-[#0F172A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Gebruikers</h1>
          <p className="text-sm text-[#94A3B8]">Alle gebruikers van het platform</p>
        </div>
      </div>
      <GebruikersClient />
    </div>
  )
}
