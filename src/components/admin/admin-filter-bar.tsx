'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'

interface FilterOption {
  value: string
  label: string
}

interface AdminFilterBarProps {
  filters?: {
    key: string
    label: string
    options: FilterOption[]
  }[]
  searchKey?: string
  searchPlaceholder?: string
}

function AdminFilterBarInner({
  filters = [],
  searchKey = 'q',
  searchPlaceholder = 'Zoeken...',
}: AdminFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState(searchParams.get(searchKey) ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue) {
        params.set(searchKey, searchValue)
      } else {
        params.delete(searchKey)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const inputCls =
    'h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] bg-white text-[#0F172A]'

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
          className={`${inputCls} pl-8 w-56`}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filters.map(filter => (
        <select
          key={filter.key}
          value={searchParams.get(filter.key) ?? ''}
          onChange={e => handleFilter(filter.key, e.target.value)}
          className={`${inputCls} pr-8`}
        >
          <option value="">{filter.label}: Alles</option>
          {filter.options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}

export function AdminFilterBar(props: AdminFilterBarProps) {
  return (
    <Suspense fallback={<div className="h-9 w-56 bg-[#F1F5F9] rounded-lg animate-pulse" />}>
      <AdminFilterBarInner {...props} />
    </Suspense>
  )
}
