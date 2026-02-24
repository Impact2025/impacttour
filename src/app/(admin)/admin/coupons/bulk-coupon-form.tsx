'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function BulkCouponForm({ tours }: { tours: { id: string; name: string }[] }) {
  const router = useRouter()
  const [prefix, setPrefix] = useState('')
  const [count, setCount] = useState(10)
  const [discountType, setDiscountType] = useState<'free' | 'percent' | 'fixed'>('free')
  const [discountValue, setDiscountValue] = useState(0)
  const [maxUses, setMaxUses] = useState<string>('1')
  const [expiresAt, setExpiresAt] = useState('')
  const [tourId, setTourId] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState('')

  const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676]"
  const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/coupons/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefix: prefix.toUpperCase().trim(),
          count,
          discountType,
          discountValue: discountType === 'free' ? 100 : discountValue,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt || null,
          tourId: tourId || null,
          description,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Kon coupons niet aanmaken')
        return
      }

      setSuccess(`${data.count} coupons aangemaakt met prefix ${data.prefix}`)
      setPrefix('')
      setDescription('')
      setTimeout(() => {
        setSuccess(null)
        router.refresh()
      }, 2000)
    } catch {
      setError('Verbindingsfout')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Prefix</label>
          <input
            type="text"
            value={prefix}
            onChange={e => setPrefix(e.target.value.toUpperCase().replace(/\s/g, ''))}
            placeholder="SCHOOL2025"
            required
            className={`${inputCls} font-mono tracking-widest`}
          />
        </div>
        <div>
          <label className={labelCls}>Aantal (max 500)</label>
          <input
            type="number" value={count} onChange={e => setCount(Number(e.target.value))}
            min={1} max={500} required className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Type korting</label>
        <select value={discountType} onChange={e => setDiscountType(e.target.value as typeof discountType)} className={inputCls}>
          <option value="free">100% Gratis</option>
          <option value="percent">Percentage (%)</option>
          <option value="fixed">Vast bedrag (€)</option>
        </select>
      </div>

      {discountType !== 'free' && (
        <div>
          <label className={labelCls}>{discountType === 'percent' ? 'Percentage' : 'Bedrag (eurocenten)'}</label>
          <input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} min={0} max={discountType === 'percent' ? 100 : undefined} className={inputCls} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Max gebruik per code</label>
          <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="1" min={1} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Vervaldatum</label>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} min={new Date().toISOString().split('T')[0]} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Geldig voor tocht</label>
        <select value={tourId} onChange={e => setTourId(e.target.value)} className={inputCls}>
          <option value="">Alle tochten</option>
          {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Intern label</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="School campagne 2025" className={inputCls} />
      </div>

      {error && <p className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>}
      {success && <p className="text-green-700 text-sm p-3 bg-[#DCFCE7] rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</p>}

      <button type="submit" disabled={isLoading || !prefix}
        className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
        {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Aanmaken...</> : `${count} coupons aanmaken`}
      </button>
    </form>
  )
}
