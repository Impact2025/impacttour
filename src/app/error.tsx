'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log naar Vercel logs (zichtbaar in dashboard)
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Er ging iets mis</h1>
        <p className="text-gray-500 text-sm mb-6">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw of ververs de pagina.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">Foutcode: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          Opnieuw proberen
        </button>
      </div>
    </div>
  )
}
