/**
 * Sliding window rate limiter.
 *
 * Gebruikt Upstash Redis wanneer UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * aanwezig zijn (productie / multi-instance). Valt terug op in-memory voor
 * lokale ontwikkeling waarbij die env vars ontbreken.
 */

// ─── In-memory fallback ────────────────────────────────────────────────────

type Window = { count: number; resetAt: number }

const store = new Map<string, Window>()

function maybeCleanup() {
  if (store.size < 500) return
  const now = Date.now()
  for (const [key, win] of store) {
    if (now > win.resetAt) store.delete(key)
  }
}

function checkRateLimitInMemory(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  maybeCleanup()
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (existing.count >= maxRequests) return false

  existing.count++
  return true
}

// ─── Upstash Redis (lazy singleton) ───────────────────────────────────────

let _redis: import('@upstash/redis').Redis | null = null
let _rl: import('@upstash/ratelimit').Ratelimit | null = null

function getUpstashRatelimiter(
  maxRequests: number,
  windowMs: number
): import('@upstash/ratelimit').Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  try {
    if (!_redis) {
      const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis')
      _redis = new Redis({ url, token })
    }
    const { Ratelimit } = require('@upstash/ratelimit') as typeof import('@upstash/ratelimit')
    // Per-call instantiation is intentional here: window params differ per route.
    return new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      analytics: false,
    })
  } catch {
    return null
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Controleer of `key` binnen het opgegeven window het maximale aantal verzoeken
 * heeft bereikt. Gebruikt Upstash Redis in productie, in-memory als fallback.
 *
 * @returns `true` als het verzoek toegestaan is, `false` als gelimiteerd.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const rl = getUpstashRatelimiter(maxRequests, windowMs)
  if (rl) {
    try {
      const { success } = await rl.limit(key)
      return success
    } catch {
      // Redis tijdelijk onbereikbaar — fall through naar in-memory
    }
  }
  return checkRateLimitInMemory(key, maxRequests, windowMs)
}

/**
 * Haal het client IP-adres op uit Vercel/Next.js headers.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * CSRF origin check voor state-wijzigende API routes.
 *
 * Browsers sturen altijd een Origin-header bij cross-origin requests.
 * Als de Origin aanwezig is maar niet overeenkomt met onze domeinen → blokkeer.
 * Geen Origin (server-to-server, PWA offline sync) → doorlaten.
 *
 * @returns `true` als het verzoek toegestaan is.
 */
export function checkOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // Server-to-server of same-origin navigatie — sta toe

  // Localhost altijd toestaan (ontwikkeling, willekeurige poort)
  if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) return true

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://impacttocht.nl'
  return origin === appUrl || origin.startsWith(appUrl)
}
