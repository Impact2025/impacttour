'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker geregistreerd:', reg.scope)

        // Detecteer nieuwe SW versie
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast('App update beschikbaar', {
                description: 'Ververs de pagina voor de nieuwste versie.',
                action: {
                  label: 'Ververs',
                  onClick: () => window.location.reload(),
                },
                duration: 10000,
              })
            }
          })
        })
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registratie mislukt:', err)
      })

    // Luister naar SW berichten (o.a. background sync confirmaties)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SUBMISSION_SYNCED') {
        toast.success('Offline inzending gesynchroniseerd')
      }
    })
  }, [])

  return null
}
