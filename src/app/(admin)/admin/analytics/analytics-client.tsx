'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'

function AnalyticsDateRangeSelectorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const days = searchParams.get('days') ?? '30'

  return (
    <select
      value={days}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('days', e.target.value)
        router.push(`${pathname}?${params.toString()}`)
      }}
      className="h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00E676]/30"
    >
      <option value="7">Laatste 7 dagen</option>
      <option value="14">Laatste 14 dagen</option>
      <option value="30">Laatste 30 dagen</option>
      <option value="90">Laatste 90 dagen</option>
    </select>
  )
}

export function AnalyticsDateRangeSelector() {
  return (
    <Suspense fallback={
      <div className="h-9 w-40 bg-[#F1F5F9] rounded-lg animate-pulse" />
    }>
      <AnalyticsDateRangeSelectorInner />
    </Suspense>
  )
}
