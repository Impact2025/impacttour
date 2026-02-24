import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import { BestellingenClient } from './bestellingen-client'
import { ShoppingCart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BestellingenPage() {
  const allTours = await db.select({ id: tours.id, name: tours.name }).from(tours).orderBy(asc(tours.name))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#00E676] rounded-xl flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-[#0F172A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Bestellingen</h1>
          <p className="text-sm text-[#94A3B8]">Overzicht van alle marketplace bestellingen</p>
        </div>
      </div>

      <BestellingenClient tourOptions={allTours} />
    </div>
  )
}
