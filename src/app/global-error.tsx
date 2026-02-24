'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  // global-error vervangt de root layout volledig — html + body zijn verplicht
  return (
    <html lang="nl">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ maxWidth: '24rem', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle style={{ width: '1.75rem', height: '1.75rem', color: '#f59e0b' }} />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Er ging iets mis</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Er is een onverwachte fout opgetreden. Probeer het opnieuw of ververs de pagina.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem', fontFamily: 'monospace' }}>
                Foutcode: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#16a34a', color: 'white', borderRadius: '0.75rem', fontWeight: 500, border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
