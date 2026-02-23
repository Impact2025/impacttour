const CACHE_VERSION = 'v3'
const CACHE_NAME = `impacttour-${CACHE_VERSION}`
const TILE_CACHE_NAME = `osm-tiles-${CACHE_VERSION}`
const STATIC_CACHE_NAME = `impacttour-static-${CACHE_VERSION}`

const DB_NAME = 'impacttour-offline'
const DB_VERSION = 1
const SUBMISSIONS_STORE = 'pending-submissions'

// Bestanden die altijd gecached worden (app shell)
const STATIC_ASSETS = [
  '/',
  '/join',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ─── IndexedDB helpers ─────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(SUBMISSIONS_STORE)) {
        db.createObjectStore(SUBMISSIONS_STORE, { autoIncrement: true })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const keysReq = store.getAllKeys()
    const valuesReq = store.getAll()
    const result = {}
    keysReq.onsuccess = () => { result.keys = keysReq.result }
    valuesReq.onsuccess = () => { result.values = valuesReq.result }
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
  })
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(key)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

// ─── Install: cache app shell ──────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Kon niet alle statische bestanden cachen:', err)
      })
    })
  )
  self.skipWaiting()
})

// ─── Activate: opruimen oude caches ───────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_NAME &&
              key !== TILE_CACHE_NAME &&
              key !== STATIC_CACHE_NAME
          )
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch: caching strategie ──────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // OpenStreetMap tiles: cache-first (werkt offline)
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached

        try {
          const response = await fetch(event.request)
          if (response.ok) {
            cache.put(event.request, response.clone())
          }
          return response
        } catch {
          return new Response('', { status: 503 })
        }
      })
    )
    return
  }

  // API routes: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - geen verbinding', offline: true }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Statische bestanden (JS/CSS/afbeeldingen): cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached

        try {
          const response = await fetch(event.request)
          if (response.ok) {
            cache.put(event.request, response.clone())
          }
          return response
        } catch {
          return new Response('', { status: 503 })
        }
      })
    )
    return
  }

  // Navigatie-requests: network-first met cached fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache succesvolle navigatie-responses
        if (
          response.ok &&
          event.request.mode === 'navigate' &&
          STATIC_ASSETS.includes(url.pathname)
        ) {
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone())
          })
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached
          if (event.request.mode === 'navigate') {
            return caches.match('/') ?? new Response('Offline', { status: 503 })
          }
          return new Response('Offline', { status: 503 })
        })
      )
  )
})

// ─── Background Sync: offline missie-inzendingen ──────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-submissions') {
    event.waitUntil(syncPendingSubmissions())
  }
})

async function syncPendingSubmissions() {
  let db
  try {
    db = await openDB()
  } catch (err) {
    console.warn('[SW] IndexedDB niet beschikbaar:', err)
    return
  }

  const { keys, values } = await getAllFromStore(db, SUBMISSIONS_STORE)

  if (!keys || keys.length === 0) {
    console.log('[SW] Geen offline inzendingen om te synchroniseren')
    return
  }

  console.log(`[SW] Synchroniseren van ${keys.length} offline inzending(en)`)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const submission = values[i]

    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      })

      if (res.ok) {
        await deleteFromStore(db, SUBMISSIONS_STORE, key)
        console.log(`[SW] Inzending ${key} gesynchroniseerd`)

        // Stuur bericht naar open clients
        const clients = await self.clients.matchAll()
        clients.forEach((client) => {
          client.postMessage({
            type: 'SUBMISSION_SYNCED',
            checkpointId: submission.checkpointId,
          })
        })
      }
    } catch {
      console.warn(`[SW] Kon inzending ${key} niet synchroniseren (nog offline)`)
    }
  }
}

// ─── Push notificaties ─────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'ImpactTocht', {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: data.tag || 'impacttour',
      data: data.url ? { url: data.url } : undefined,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})
