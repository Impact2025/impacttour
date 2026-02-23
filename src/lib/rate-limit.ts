/**
 * In-memory sliding window rate limiter.
 *
 * Werkt per serverless instance — goed voor MVP-schaal.
 * Bij hoog verkeer: vervang door Upstash Redis (@upstash/ratelimit).
 */

type Window = { count: number; resetAt: number }

const store = new Map<string, Window>()

// Ruim verlopen entries op als de Map te groot wordt (memory guard)
function maybeCleanup() {
  if (store.size < 500) return
  const now = Date.now()
  for (const [key, win] of store) {
    if (now > win.resetAt) store.delete(key)
  }
}

/**
 * Controleer of `key` binnen het opgegeven window het maximale aantal verzoeken
 * heeft bereikt.
 *
 * @returns `true` als het verzoek toegestaan is, `false` als gelimiteerd.
 */
export function checkRateLimit(
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
