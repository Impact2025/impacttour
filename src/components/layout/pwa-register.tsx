'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  // Service Worker registratie
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast('App update beschikbaar', {
                description: 'Ververs de pagina voor de nieuwste versie.',
                action: { label: 'Ververs', onClick: () => window.location.reload() },
                duration: 10000,
              })
            }
          })
        })
      })
      .catch((err) => console.warn('[PWA] Service Worker registratie mislukt:', err))

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SUBMISSION_SYNCED') {
        toast.success('Offline inzending gesynchroniseerd')
      }
    })
  }, [])

  // Installatie-prompt opvangen
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION_MS) return

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setShowBanner(false))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setShowBanner(false)
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="bg-[#0F172A] rounded-2xl p-4 flex items-center gap-3 max-w-md mx-auto"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)' }}
      >
        <div className="w-11 h-11 rounded-xl bg-[#00E676] flex items-center justify-center shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-72.png" alt="" className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Voeg toe aan startscherm</p>
          <p className="text-[#64748B] text-xs mt-0.5">Sneller laden &amp; offline spelen</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-[#00E676] text-[#0F172A] font-black text-xs px-3 py-2 rounded-xl shrink-0 active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Installeer
        </button>
        <button
          onClick={handleDismiss}
          className="text-[#64748B] shrink-0 p-1 active:scale-95 transition-transform"
          aria-label="Sluiten"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
