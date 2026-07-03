import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { articles } from '@/lib/content'
import { submitUrlsToIndexNow } from '@/lib/seo/indexnow'
import { getSiteUrl } from '@/lib/seo/site-url'

const SITE_URL = getSiteUrl()

/**
 * GET /api/cron/indexnow
 * Vercel Cron Job: dagelijks (geconfigureerd in vercel.json)
 * Pingt IndexNow met alle artikel- en tocht-URLs zodat nieuwe of gewijzigde
 * content snel opnieuw wordt geïndexeerd, zonder te wachten op een crawl.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const articleUrls = articles.map((a) => `${SITE_URL}/${a.category}/${a.slug}`)

  let tourUrls: string[] = []
  try {
    const publishedTours = await db.select({ id: tours.id }).from(tours).where(eq(tours.isPublished, true))
    tourUrls = publishedTours.map((t) => `${SITE_URL}/tochten/${t.id}`)
  } catch {
    // Cron mag niet falen zonder DB
  }

  const staticUrls = [SITE_URL, `${SITE_URL}/blog`, `${SITE_URL}/kennisbank`, `${SITE_URL}/tochten`]

  const urls = [...staticUrls, ...articleUrls, ...tourUrls]
  const result = await submitUrlsToIndexNow(urls)

  return NextResponse.json({ submitted: urls.length, ...result })
}
