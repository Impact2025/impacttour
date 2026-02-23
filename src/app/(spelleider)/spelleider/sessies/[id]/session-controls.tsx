'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const TRANSITIONS: Record<string, { next: string; label: string; color: string }[]> = {
  draft: [{ next: 'lobby', label: 'Lobby openen', color: 'bg-blue-600 hover:bg-blue-700' }],
  lobby: [{ next: 'active', label: 'Tocht starten', color: 'bg-[#00C853] hover:bg-[#00A846]' }],
  active: [
    { next: 'paused', label: 'Pauzeren', color: 'bg-[#F59E0B] hover:bg-[#D97706]' },
    { next: 'completed', label: 'Afronden', color: 'bg-[#64748B] hover:bg-[#475569]' },
  ],
  paused: [{ next: 'active', label: 'Hervatten', color: 'bg-[#00C853] hover:bg-[#00A846]' }],
}

export function SessionControls({
  sessionId,
  currentStatus,
}: {
  sessionId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const transitions = TRANSITIONS[currentStatus] ?? []

  const handleTransition = async (nextStatus: string) => {
    if (nextStatus === 'completed' && !confirm('Wil je de tocht afronden voor alle teams?')) return

    setIsLoading(true)
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (res.ok) {
      toast.success(`Sessie is nu: ${nextStatus}`)
      router.refresh()
    } else {
      toast.error('Status bijwerken mislukt')
    }
    setIsLoading(false)
  }

  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return (
      <div className="text-center py-2 text-sm text-[#94A3B8]">
        Sessie afgerond — bekijk het rapport voor de resultaten.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((t) => (
        <button
          key={t.next}
          onClick={() => handleTransition(t.next)}
          disabled={isLoading}
          className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${t.color}`}
        >
          {isLoading ? '...' : t.label}
        </button>
      ))}
    </div>
  )
}
