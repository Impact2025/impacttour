/**
 * Genormaliseerde site-URL, zonder trailing slash of onzichtbare whitespace/newlines.
 * NEXT_PUBLIC_APP_URL heeft in Vercel eerder een letterlijke trailing "\n" bevat
 * (ontstaan bij het toevoegen van de env-var) — .trim() voorkomt dat dit soort
 * onzichtbare tekens doorlekken naar sitemap-URLs, canonical tags of HTTP-headers.
 */
export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://ictusgo.nl').trim()
  return raw.replace(/\/+$/, '')
}
