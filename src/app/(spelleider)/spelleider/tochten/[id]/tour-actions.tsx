'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function TourActions({
  tourId,
  isPublished,
}: {
  tourId: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleTogglePublish = async () => {
    setIsToggling(true)
    await fetch(`/api/tours/${tourId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !isPublished }),
    })
    router.refresh()
    setIsToggling(false)
  }

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze tocht wil verwijderen? Dit verwijdert ook alle checkpoints.')) return
    setIsDeleting(true)
    await fetch(`/api/tours/${tourId}`, { method: 'DELETE' })
    router.push('/spelleider/tochten')
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTogglePublish}
        disabled={isToggling}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isPublished
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {isToggling ? '...' : isPublished ? 'Depubliceren' : 'Publiceren'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
      >
        {isDeleting ? 'Verwijderen...' : 'Verwijderen'}
      </button>
    </div>
  )
}
