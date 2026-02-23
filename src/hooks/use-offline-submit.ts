'use client'

import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useOnlineStatus } from './use-online-status'

const DB_NAME = 'impacttour-offline'
const DB_VERSION = 1
const SUBMISSIONS_STORE = 'pending-submissions'

interface PendingSubmission {
  sessionId: string
  teamToken: string
  checkpointId: string
  answer?: string
  photoUrl?: string
  savedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(SUBMISSIONS_STORE)) {
        db.createObjectStore(SUBMISSIONS_STORE, { autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveToIndexedDB(submission: PendingSubmission): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SUBMISSIONS_STORE, 'readwrite')
    tx.objectStore(SUBMISSIONS_STORE).add(submission)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function requestBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.ready
  // SyncManager is not in standard TS lib yet — use type cast
  const reg = registration as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> }
  }
  if (reg.sync) {
    await reg.sync.register('sync-submissions')
  }
}

/**
 * useOfflineSubmit hook
 * Offline-first wrapper voor missie-inzendingen.
 * - Online: directe POST naar /api/game/submit
 * - Offline: opslaan in IndexedDB + Background Sync registreren
 *
 * Luistert ook naar SW berichten voor gesynchroniseerde inzendingen.
 */
export function useOfflineSubmit() {
  const isOnline = useOnlineStatus()

  // Luister naar SW sync berichten
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SUBMISSION_SYNCED') {
        toast.success('Offline inzending gesynchroniseerd', { duration: 4000 })
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage)
  }, [])

  const submit = useCallback(
    async (payload: {
      sessionId: string
      teamToken: string
      checkpointId: string
      answer?: string
      photoUrl?: string
    }) => {
      if (isOnline) {
        // Online: normale submit
        const res = await fetch('/api/game/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        return res
      }

      // Offline: opslaan in IndexedDB
      try {
        await saveToIndexedDB({ ...payload, savedAt: Date.now() })
        await requestBackgroundSync()
        toast.info('Offline opgeslagen — wordt gesynchroniseerd zodra je weer online bent', {
          duration: 6000,
        })
        return null
      } catch (err) {
        console.error('[useOfflineSubmit] IndexedDB opslaan mislukt:', err)
        toast.error('Kon inzending niet opslaan (offline storage niet beschikbaar)')
        return null
      }
    },
    [isOnline]
  )

  return { submit, isOnline }
}
