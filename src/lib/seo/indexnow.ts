import { getSiteUrl } from './site-url'

const INDEXNOW_KEY = '64a9b2f1c8e74d5a9b0c3d2e1f4a6c7b'
const SITE_URL = getSiteUrl()

/**
 * Pingt IndexNow met een batch URLs zodat zoekmachines (Bing, Yandex, en via
 * hun IndexNow-partnership ook Seznam/Naver) near-instant kunnen herindexeren.
 * Sleutel wordt geverifieerd via /api/indexnow-key en het statische bestand
 * onder public/ — beide moeten hetzelfde tekstbestand teruggeven.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<{ ok: boolean; status: number }> {
  if (urls.length === 0) return { ok: true, status: 200 }

  const host = new URL(SITE_URL).host

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}
