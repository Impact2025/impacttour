'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Suspense } from 'react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render: (row: T) => React.ReactNode
  width?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyField: keyof T
  emptyText?: string
}

function AdminTableInner<T>({
  columns,
  rows,
  keyField,
  emptyText = 'Geen resultaten',
}: AdminTableProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const sortKey = searchParams.get('sort') ?? ''
  const sortDir = searchParams.get('dir') ?? 'desc'

  const handleSort = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sortKey === key) {
      params.set('dir', sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('sort', key)
      params.set('dir', 'desc')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap ${
                  col.sortable ? 'cursor-pointer hover:text-[#64748B] select-none' : ''
                }`}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable &&
                    (sortKey === col.key ? (
                      sortDir === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 opacity-40" />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[#94A3B8] text-sm"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr
                key={String(row[keyField])}
                className="hover:bg-[#F8FAFC] transition-colors"
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-[#0F172A]">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function AdminTable<T>(props: AdminTableProps<T>) {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-center text-[#94A3B8] text-sm">Laden...</div>}>
      <AdminTableInner {...props} />
    </Suspense>
  )
}
