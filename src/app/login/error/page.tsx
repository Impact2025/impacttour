'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { AlertTriangle } from 'lucide-react'

const errorMessages: Record<string, string> = {
  Configuration: 'Er is een configuratiefout opgetreden.',
  AccessDenied: 'Toegang geweigerd.',
  Verification: 'De inloglink is verlopen of al gebruikt. Vraag een nieuwe aan.',
  Default: 'Er is een onbekende fout opgetreden.',
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ?? 'Default'
  const message = errorMessages[error] ?? errorMessages.Default

  return (
    <>
      <p className="text-gray-600 mb-6">{message}</p>
      <Link
        href="/login"
        className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Opnieuw proberen
      </Link>
    </>
  )
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Inloggen mislukt
        </h1>
        <Suspense fallback={<p className="text-gray-400">Laden...</p>}>
          <AuthErrorContent />
        </Suspense>
      </div>
    </main>
  )
}
