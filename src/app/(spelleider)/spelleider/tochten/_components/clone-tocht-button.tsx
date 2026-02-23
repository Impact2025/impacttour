'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CloneTochtButton({ tourId }: { tourId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClone() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tours/${tourId}/clone`, { method: 'POST' })
      if (!res.ok) throw new Error('Klonen mislukt')
      const { tourId: newId } = await res.json()
      router.push(`/spelleider/tochten/${newId}?cloned=1`)
    } catch {
      alert('Er is iets misgegaan. Probeer opnieuw.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClone}
      disabled={loading}
      className="px-4 py-2 bg-[#00E676] text-[#0F172A] rounded-lg text-sm font-semibold hover:bg-green-400 disabled:opacity-50 transition-colors shrink-0"
    >
      {loading ? 'Bezig...' : 'Gebruik →'}
    </button>
  )
}
