'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[GameError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Game fout opgetreden</h1>
        <p className="text-gray-400 text-sm mb-6">
          De game pagina kon niet geladen worden. Controleer je verbinding en probeer opnieuw.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Opnieuw proberen
          </button>
          <button
            onClick={() => router.push('/join')}
            className="w-full py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
          >
            Terug naar join
          </button>
        </div>
      </div>
    </div>
  )
}
