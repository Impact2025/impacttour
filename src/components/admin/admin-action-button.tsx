'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminActionButtonProps {
  label: string
  apiUrl: string
  method?: 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  variant?: 'primary' | 'danger' | 'ghost'
  onSuccess?: () => void
  confirmMessage?: string
  className?: string
  icon?: React.ReactNode
}

export function AdminActionButton({
  label,
  apiUrl,
  method = 'PATCH',
  body,
  variant = 'ghost',
  onSuccess,
  confirmMessage,
  className,
  icon,
}: AdminActionButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const variantCls = {
    primary: 'bg-[#00E676] text-[#0F172A] hover:bg-[#00C853]',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
    ghost: 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]',
  }[variant]

  const handleClick = async () => {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(apiUrl, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Er is een fout opgetreden')
        return
      }
      if (onSuccess) onSuccess()
      else router.refresh()
    } catch {
      setError('Verbindingsfout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${variantCls} ${className ?? ''}`}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}
        {label}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
