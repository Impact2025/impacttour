import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://ictusgo.nl').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/over-ons`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/impact`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/prijzen`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/contact`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tocht-op-maat`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tochten`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/artikelen`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
  ]

  // Dynamic tours from DB
  let tourPages: MetadataRoute.Sitemap = []
  try {
    const publishedTours = await db
      .select({ id: tours.id, updatedAt: tours.updatedAt })
      .from(tours)
      .where(eq(tours.isPublished, true))

    tourPages = publishedTours.map(t => ({
      url: `${BASE}/tochten/${t.id}`,
      lastModified: t.updatedAt ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Sitemap works without DB during build
  }

  return [...staticPages, ...tourPages]
}
